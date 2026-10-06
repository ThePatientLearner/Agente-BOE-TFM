#!/usr/bin/env python3
"""Exporta la copia académica depurada y verifica su manifiesto SHA-256.

Uso desde cualquier directorio:
    python3 scripts/export_tfm.py /ruta/a/carpeta-vacia
    python3 scripts/export_tfm.py --verify /ruta/a/copia

Solo utiliza la biblioteca estándar. No elimina contenido, no crea ZIP y no
modifica Git. Los archivos .env reales ni siquiera se abren para seleccionarlos.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
from datetime import datetime, timezone


MANIFEST_NAME = "tfm-manifest.json"
ROOT_FILES = frozenset({
    "README.md", "AGENTS.md", "LEGAL.md", ".gitignore", ".gitattributes", ".dockerignore",
    ".env.example", "package.json", "package-lock.json", "tsconfig.base.json",
    "docker-compose.yml",
})
MONOLITH_FILES = frozenset({
    "Dockerfile", "package.json", "tsconfig.json", "vitest.config.ts",
    "vitest.integration.config.ts", "drizzle.config.ts", ".dependency-cruiser.cjs",
})
WEB_FILES = frozenset({
    "Dockerfile", "package.json", "tsconfig.json", "next.config.ts",
    "next-env.d.ts", "vitest.config.ts",
})
SCRIPT_FILES = frozenset({
    "tfm-demo.mjs", "generate-electricidad-context.mjs", "build_tfm_docs.py",
    "export_tfm.py", "test-electricidad-accounts.mjs",
})
FORBIDDEN_PARTS = frozenset({
    ".git", "node_modules", "dist", ".next", "__pycache__", "coverage",
    "backups", ".cache", ".pytest_cache",
})
FORBIDDEN_SUFFIXES = frozenset({".pyc", ".log", ".tsbuildinfo", ".pem", ".key", ".p12", ".pfx"})


class ExportError(Exception):
    """Error controlado que deja los archivos existentes intactos."""


def safe_relative(value: str) -> PurePosixPath:
    path = PurePosixPath(value)
    if (not value or path.is_absolute() or "\\" in value
            or any(part in {"", ".", ".."} for part in value.split("/"))):
        raise ExportError(f"Ruta no válida en el inventario: {value!r}")
    return path


def allowed(value: str) -> bool:
    path = safe_relative(value)
    parts = path.parts
    if any(part.casefold() in FORBIDDEN_PARTS for part in parts):
        return False
    if path.name == ".DS_Store" or path.suffix.casefold() in FORBIDDEN_SUFFIXES:
        return False
    if any(part.casefold().startswith(".env") for part in parts):
        return value == ".env.example"
    if len(parts) == 1:
        return value in ROOT_FILES
    if parts[0] == "scripts":
        return len(parts) == 2 and parts[1] in SCRIPT_FILES
    if parts[:2] == ("apps", "monolith"):
        tail = parts[2:]
        return (len(tail) == 1 and tail[0] in MONOLITH_FILES
                or len(tail) > 1 and tail[0] == "src"
                or len(tail) > 1 and tail[0] == "drizzle" and path.suffix == ".sql")
    if parts[:2] == ("apps", "web"):
        tail = parts[2:]
        if len(tail) == 1:
            return tail[0] in WEB_FILES
        if len(tail) > 1 and tail[0] in {"src", "private"}:
            return True
        return (len(tail) > 1 and tail[0] == "public"
                and not any(part.casefold() in {"cv", "tfm"} for part in tail[1:]))
    if parts[:2] == ("docs", "tfm"):
        return len(parts) > 3 and parts[2] in {"source", "capturas", "evidencias"}
    return parts[:2] == ("output", "pdf") and len(parts) > 2 and path.suffix.casefold() == ".pdf"


def regular_file(root: Path, relative: str) -> Path:
    path = root.joinpath(*safe_relative(relative).parts)
    cursor = path
    while cursor != root:
        if cursor.is_symlink():
            raise ExportError(f"No se permiten enlaces simbólicos: {relative}")
        cursor = cursor.parent
    try:
        mode = path.lstat().st_mode
    except FileNotFoundError as exc:
        raise ExportError(f"Falta un archivo seleccionado: {relative}") from exc
    if not stat.S_ISREG(mode):
        raise ExportError(f"No es un archivo regular: {relative}")
    return path


def digest(path: Path) -> tuple[str, int]:
    sha = hashlib.sha256()
    size = 0
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            sha.update(block)
            size += len(block)
    return sha.hexdigest(), size


def inventory(source: Path) -> tuple[list[str], int]:
    try:
        process = subprocess.run(
            ["git", "-C", str(source), "ls-files", "--cached", "--others",
             "--exclude-standard", "-z"],
            check=True, capture_output=True,
        )
    except FileNotFoundError as exc:
        raise ExportError("Se necesita Git para inventariar la copia de origen.") from exc
    except subprocess.CalledProcessError as exc:
        raise ExportError("El origen debe ser un repositorio Git accesible.") from exc
    candidates = {os.fsdecode(item) for item in process.stdout.split(b"\0") if item}
    selected = sorted(value for value in candidates if allowed(value))
    if not selected:
        raise ExportError("La lista permitida no ha seleccionado ningún archivo.")
    for value in selected:
        regular_file(source, value)
    return selected, len(candidates) - len(selected)


def export(source: Path, destination: Path) -> dict:
    if destination.is_symlink():
        raise ExportError("El destino no puede ser un enlace simbólico.")
    if destination.exists() and (not destination.is_dir() or any(destination.iterdir())):
        raise ExportError("El destino debe ser una carpeta vacía; no se borrará su contenido.")
    selected, excluded = inventory(source)
    destination.mkdir(parents=True, exist_ok=True)
    # Volver a comprobar antes de copiar, también si otro proceso creó la carpeta.
    if any(destination.iterdir()):
        raise ExportError("El destino ya contiene archivos; exportación cancelada.")
    files = []
    for relative in selected:
        original = regular_file(source, relative)
        target = destination.joinpath(*PurePosixPath(relative).parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        # 'xb' impide sobrescribir incluso si aparece un archivo durante la copia.
        with original.open("rb") as incoming, target.open("xb") as outgoing:
            shutil.copyfileobj(incoming, outgoing)
        target.chmod(stat.S_IMODE(original.stat().st_mode) & 0o777)
        checksum, size = digest(target)
        files.append({"path": relative, "bytes": size, "sha256": checksum})
    manifest = {
        "schema_version": 1,
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "selection": "git ls-files --cached --others --exclude-standard; allowlist export_tfm.py",
        "file_count": len(files),
        "total_bytes": sum(item["bytes"] for item in files),
        "excluded_candidate_count": excluded,
        "manifest_excluded_from_hashes": MANIFEST_NAME,
        "files": files,
    }
    with (destination / MANIFEST_NAME).open("x", encoding="utf-8") as stream:
        json.dump(manifest, stream, ensure_ascii=False, indent=2)
        stream.write("\n")
    verify(destination)
    return manifest


def verify(destination: Path) -> dict:
    if destination.is_symlink() or not destination.is_dir():
        raise ExportError("La copia a verificar debe ser una carpeta normal.")
    manifest_path = regular_file(destination, MANIFEST_NAME)
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise ExportError("El manifiesto no es JSON UTF-8 válido.") from exc
    if not isinstance(manifest, dict) or manifest.get("schema_version") != 1:
        raise ExportError("Versión de manifiesto no admitida.")
    files = manifest.get("files")
    if not isinstance(files, list) or not files:
        raise ExportError("El manifiesto no contiene una lista de archivos válida.")
    expected = set()
    total = 0
    for entry in files:
        if not isinstance(entry, dict) or not isinstance(entry.get("path"), str):
            raise ExportError("Entrada de manifiesto no válida.")
        relative = entry["path"]
        if relative == MANIFEST_NAME or relative in expected or not allowed(relative):
            raise ExportError(f"Archivo repetido o fuera de la lista permitida: {relative}")
        if (not isinstance(entry.get("sha256"), str)
                or not re.fullmatch(r"[0-9a-f]{64}", entry["sha256"])
                or type(entry.get("bytes")) is not int or entry["bytes"] < 0):
            raise ExportError(f"Metadatos de integridad no válidos: {relative}")
        checksum, size = digest(regular_file(destination, relative))
        if checksum != entry["sha256"] or size != entry["bytes"]:
            raise ExportError(f"El archivo no coincide con su SHA-256 o tamaño: {relative}")
        expected.add(relative)
        total += size
    if manifest.get("file_count") != len(files) or manifest.get("total_bytes") != total:
        raise ExportError("Los totales del manifiesto no coinciden con sus archivos.")
    found = set()
    for directory, subdirectories, filenames in os.walk(destination, followlinks=False):
        for name in subdirectories:
            if (Path(directory) / name).is_symlink():
                raise ExportError("La copia contiene un directorio simbólico no permitido.")
        for name in filenames:
            relative = (Path(directory) / name).relative_to(destination).as_posix()
            regular_file(destination, relative)
            found.add(relative)
    if found != expected | {MANIFEST_NAME}:
        extra = sorted(found - expected - {MANIFEST_NAME})
        raise ExportError(f"La copia contiene archivos ajenos al manifiesto: {', '.join(extra)}")
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("destination", type=Path, help="Carpeta de destino vacía o copia que verificar.")
    parser.add_argument("--verify", action="store_true", help="Solo verificar el manifiesto, sin exportar.")
    args = parser.parse_args()
    destination = args.destination.expanduser().absolute()
    source = Path(__file__).resolve().parent.parent
    try:
        result = verify(destination) if args.verify else export(source, destination)
    except (ExportError, OSError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    action = "Verificados" if args.verify else "Exportados y verificados"
    print(f"{action} {result['file_count']} archivos ({result['total_bytes']} bytes).")
    print(f"Destino: {destination}")
    print(f"Manifiesto: {destination / MANIFEST_NAME}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

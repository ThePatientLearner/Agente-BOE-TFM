"use client";

import { useEffect, useState } from "react";

const COMPARTIR = {
  title: "¡Haz que todos se suscriban! — Agente BOE",
  text: "Llena la caja fuerte suiza antes de quedarte sin blanca. Quien más guarde gana finanfocus.com PRO gratis de por vida.",
  url: "https://agenteboe.com/juego",
};

/**
 * Contador de partidas y botón de compartir, bajo la entradilla del juego.
 *
 * El contador se pide al montar y no en el servidor: la página es estática,
 * así que un `fetch` en el render dejaría el número congelado en el momento
 * del build y diría "200" durante semanas.
 */
export function JuegoCabecera() {
  const [jugadas, setJugadas] = useState<number | null>(null);
  /** "nada" · "copiado" tras copiar · "manual" si no se pudo y toca a mano. */
  const [aviso, setAviso] = useState<"nada" | "copiado" | "manual">("nada");

  useEffect(() => {
    let vivo = true;
    fetch("/api/juego/marcador", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { partidasJugadas?: number } | null) => {
        // Si la API no responde no se enseña nada: mejor una línea de menos
        // que un contador inventado.
        if (vivo && typeof d?.partidasJugadas === "number") setJugadas(d.partidasJugadas);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  /**
   * Respaldo para navegadores que no dan permiso al portapapeles moderno
   * (o que no están en contexto seguro). `execCommand` está obsoleto pero
   * sigue funcionando justo donde el otro falla, que es de lo que se trata.
   */
  const copiarAlPortapapeles = async (texto: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      /* sin permiso: se prueba el modo antiguo */
    }
    try {
      const campo = document.createElement("textarea");
      campo.value = texto;
      campo.setAttribute("readonly", "");
      campo.style.position = "fixed";
      campo.style.opacity = "0";
      document.body.appendChild(campo);
      campo.select();
      const copiado = document.execCommand("copy");
      campo.remove();
      return copiado;
    } catch {
      return false;
    }
  };

  /**
   * En el móvil abre el menú de compartir del sistema, que es donde están
   * WhatsApp y Telegram. En el escritorio casi nunca existe, así que copia el
   * enlace y lo dice; y si tampoco se puede copiar, lo enseña para copiarlo a
   * mano. Un botón que no hace nada visible parece roto.
   */
  const compartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share(COMPARTIR);
        return;
      } catch {
        // Cancelado por quien mira, o no permitido: se cae al portapapeles.
      }
    }
    const copiado = await copiarAlPortapapeles(COMPARTIR.url);
    setAviso(copiado ? "copiado" : "manual");
    if (copiado) setTimeout(() => setAviso("nada"), 2500);
  };

  return (
    <div className="juego-cabecera-pie">
      <p className="juego-contador" aria-live="polite">
        {jugadas === null ? (
          <span className="juego-contador-hueco">&nbsp;</span>
        ) : (
          <>
            Ya han jugado <strong>{jugadas.toLocaleString("es-ES")}</strong> personas
          </>
        )}
      </p>

      <button type="button" className="juego-compartir" onClick={compartir}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18 16.1a3 3 0 0 0-2 .8l-7.1-4.2a3 3 0 0 0 0-1.4L16 7.1a3 3 0 1 0-1-2.1c0 .2 0 .5.1.7L8 9.9a3 3 0 1 0 0 4.2l7.1 4.2c0 .2-.1.4-.1.7a3 3 0 1 0 3-2.9Z"
          />
        </svg>
        {aviso === "copiado" ? "¡Enlace copiado!" : "Compartir con amigos"}
      </button>

      {aviso === "manual" && (
        <p className="juego-compartir-manual">
          Copia el enlace: <code>{COMPARTIR.url}</code>
        </p>
      )}
    </div>
  );
}

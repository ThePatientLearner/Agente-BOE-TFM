import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

/**
 * Proxy de la búsqueda sobre el archivo completo. Reenvía filtros y la
 * contraseña al monolito; el navegador solo ve rutas de Next.
 */
export async function GET(request: Request) {
  const password = request.headers.get("x-full-search-password") ?? "";
  if (!password) {
    return NextResponse.json({ error: "Falta la contraseña" }, { status: 401 });
  }

  const incoming = new URL(request.url);
  const upstream = new URL(`${API_URL}/api/search`);
  for (const key of ["q", "from", "to", "minImpact"] as const) {
    const value = incoming.searchParams.get(key);
    if (value) upstream.searchParams.set(key, value);
  }

  try {
    const response = await fetch(upstream, {
      headers: { "x-full-search-password": password },
      cache: "no-store",
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json({ error: "API no disponible" }, { status: 502 });
  }
}

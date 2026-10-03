import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

/**
 * Proxy del desbloqueo de la búsqueda completa. El navegador no habla con
 * el monolito: evita CORS y mantiene `API_URL` solo en el servidor.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const password =
    body && typeof body === "object" && "password" in body && typeof body.password === "string"
      ? body.password
      : "";

  try {
    const response = await fetch(`${API_URL}/api/search/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      cache: "no-store",
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    return NextResponse.json(
      { error: payload.error ?? "No se pudo desbloquear" },
      { status: response.status },
    );
  } catch {
    return NextResponse.json({ error: "API no disponible" }, { status: 502 });
  }
}

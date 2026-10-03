import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

/**
 * Proxy del registro de partidas. Reenvía el cuerpo tal cual: quien valida
 * el marcador y genera el código es el monolito, no esta capa.
 *
 * Viaja también la IP del visitante en `x-forwarded-for`, porque el límite
 * por IP del monolito se aplica del otro lado y aquí, sin cabecera, todas
 * las partidas del mundo le llegarían desde la misma dirección: la de este
 * proceso de Next.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const reenviada = request.headers.get("x-forwarded-for");

  try {
    const response = await fetch(`${API_URL}/api/juego/partidas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(reenviada ? { "x-forwarded-for": reenviada } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: "API no disponible" }, { status: 502 });
  }
}

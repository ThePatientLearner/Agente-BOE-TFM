import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

/**
 * Proxy del marcador del juego: top 5 y contador de partidas. Igual que el
 * resto de rutas de `api/`, el navegador no habla con el monolito — así no
 * hay CORS y `API_URL` no sale del servidor.
 *
 * Sin caché: el contador y el ranking cambian con cada partida, y verlos
 * congelados es justo lo que quita la gracia de jugar.
 */
export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/juego/marcador`, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "Marcador no disponible" }, { status: response.status });
    }
    return NextResponse.json(await response.json(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ error: "API no disponible" }, { status: 502 });
  }
}

import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/review-status`, {
      cache: "no-store", signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Estado no disponible");
    return NextResponse.json(await response.json(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Estado no disponible" }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}

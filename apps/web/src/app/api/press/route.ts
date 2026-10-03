import { NextResponse } from "next/server";
import { fetchPressSnapshot } from "@/lib/press";

/** La respuesta es actual, pero las consultas RSS mantienen su caché
 * compartida de diez minutos para todos los visitantes. */
export async function GET() {
  return NextResponse.json(await fetchPressSnapshot(), { headers: { "Cache-Control": "no-store" } });
}

import { NextRequest, NextResponse } from 'next/server';
import { ELECTRICIDAD_API, PRIVATE_HEADERS, SESSION_COOKIE } from '@/lib/electricidad-auth';
import { hasAllowedOrigin } from '@/lib/request-origin';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Qué bots hay configurados, para el selector del administrador. El monolito
 * ya responde 403 a quien no lo sea: aquí no se decide el privilegio, solo se
 * reenvía la sesión.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'No disponible.' }, { status: 401, headers: PRIVATE_HEADERS });
  try {
    const upstream = await fetch(`${ELECTRICIDAD_API}/api/assistant/models`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(10_000),
    });
    return NextResponse.json(await upstream.json(), { status: upstream.status, headers: PRIVATE_HEADERS });
  } catch {
    return NextResponse.json({ error: 'No disponible ahora.' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}

/** Cambia la IA de toda la aplicación. El monolito exige sesión de admin. */
export async function POST(request: NextRequest) {
  const error = (message: string, status: number) => NextResponse.json({ error: message }, { status, headers: PRIVATE_HEADERS });
  if (!hasAllowedOrigin(request)) return error('Origen no permitido.', 403);
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return error('No disponible.', 401);
  const body = await request.text();
  if (Buffer.byteLength(body) > 1024) return error('Petición demasiado grande.', 413);
  try { JSON.parse(body); } catch { return error('Petición inválida.', 400); }
  try {
    const upstream = await fetch(`${ELECTRICIDAD_API}/api/assistant/model`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body, cache: 'no-store', signal: AbortSignal.timeout(10_000),
    });
    return NextResponse.json(await upstream.json(), { status: upstream.status, headers: PRIVATE_HEADERS });
  } catch { return error('No se ha podido guardar. Inténtalo de nuevo.', 503); }
}

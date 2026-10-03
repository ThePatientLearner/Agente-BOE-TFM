import { NextRequest, NextResponse } from 'next/server';
import { ELECTRICIDAD_API, PRIVATE_HEADERS, SESSION_COOKIE } from '@/lib/electricidad-auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Con los repasos activados el monolito hace hasta tres llamadas seguidas al
// modelo, así que el plazo sube al máximo que concede el plan de Vercel.
// Si se reduce, los repasos se quedarán cortos y saldrá el borrador.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const error = (message: string, status: number) => NextResponse.json({ error: message }, { status, headers: PRIVATE_HEADERS });
  if (request.headers.get('origin') !== request.nextUrl.origin) return error('Origen no permitido.', 403);
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return error('Inicia sesión para hablar con el asistente.', 401);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return error('Formato no permitido.', 415);
  const body = await request.text();
  if (Buffer.byteLength(body) > 12_288) return error('Petición demasiado grande.', 413);
  try { JSON.parse(body); } catch { return error('Petición inválida.', 400); }
  try {
    const upstream = await fetch(`${ELECTRICIDAD_API}/api/assistant`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body, cache: 'no-store', signal: AbortSignal.timeout(55_000),
    });
    return NextResponse.json(await upstream.json(), { status: upstream.status, headers: PRIVATE_HEADERS });
  } catch { return error('El asistente no ha podido responder. Inténtalo más tarde.', 503); }
}

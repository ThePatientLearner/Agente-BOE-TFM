import { NextRequest, NextResponse } from 'next/server';
import { ELECTRICIDAD_API, PRIVATE_HEADERS, SESSION_COOKIE } from '@/lib/electricidad-auth';
import { hasAllowedOrigin } from '@/lib/request-origin';
export function createAccountProxy(area: 'electricidad' | 'account') {
return async function proxy(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  const allowed = request.method === 'GET' ? (area === 'account' ? ['me'] : ['me','users']) : (area === 'account' ? ['register','login','logout','password'] : ['register','login','logout','password','status']);
  if (!allowed.includes(action)) return NextResponse.json({ error: 'No encontrado.' }, { status: 404, headers: PRIVATE_HEADERS });
  let body: string | undefined;
  if (request.method === 'POST') {
    if (!hasAllowedOrigin(request)) return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403, headers: PRIVATE_HEADERS });
    if (!request.headers.get('content-type')?.startsWith('application/json')) return NextResponse.json({ error: 'Formato no permitido.' }, { status: 415, headers: PRIVATE_HEADERS });
    body = await request.text();
    if (Buffer.byteLength(body) > 4096) return NextResponse.json({ error: 'Petición demasiado grande.' }, { status: 413, headers: PRIVATE_HEADERS });
    try { JSON.parse(body); } catch { return NextResponse.json({ error: 'Petición inválida.' }, { status: 400, headers: PRIVATE_HEADERS }); }
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value ?? '';
  try {
    const upstream = await fetch(`${ELECTRICIDAD_API}/api/${area}/${action}`, { method: request.method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body, cache: 'no-store', signal: AbortSignal.timeout(10000) });
    const payload = await upstream.json();
    const session = payload.token;
    delete payload.token; // El token solo se entrega en la cookie HttpOnly.
    const response = NextResponse.json(payload, { status: upstream.status, headers: PRIVATE_HEADERS });
    if (upstream.ok && action === 'login' && typeof session === 'string') response.cookies.set(SESSION_COOKIE, session, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 604800 });
    if (upstream.ok && ['logout','password'].includes(action)) response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
    return response;
  } catch { return NextResponse.json({ error: 'El acceso no está disponible. Inténtalo en unos instantes.' }, { status: 503, headers: PRIVATE_HEADERS }); }
}
}

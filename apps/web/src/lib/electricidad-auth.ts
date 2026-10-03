import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { NextRequest } from 'next/server';
export const SESSION_COOKIE = 'electricidad_session';
export const ELECTRICIDAD_API = process.env.API_URL ?? 'http://localhost:3001';
export const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', Vary: 'Cookie' };
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

export async function serveElectricidad(request: NextRequest, section: 'electricidad' | 'electricidadTest', path: string[] = []) {
  if (path.length && !(path.length === 1 && ['index.html', 'cuenta'].includes(path[0]))) return new Response('No encontrado', { status: 404, headers: PRIVATE_HEADERS });
  let user: { id: string; username: string; role: string; studyAccess?: boolean } | undefined;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const response = await fetch(`${ELECTRICIDAD_API}/api/electricidad/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
      if (response.ok) user = (await response.json()).user;
      else if (response.status !== 401) throw new Error('API unavailable');
    } catch { return new Response('No se puede comprobar tu sesión. Vuelve a intentarlo en unos instantes.', { status: 503, headers: PRIVATE_HEADERS }); }
  }
  const headers = { ...PRIVATE_HEADERS, 'Content-Type': 'text/html; charset=utf-8' };
  // Fallar cerrado: una cuenta pública del bot no habilita los HTML privados.
  if (user && user.role !== 'admin' && user.studyAccess !== true) {
    return new Response('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Acceso al cuaderno</title><main style="max-width:40rem;margin:10vh auto;padding:24px;font:18px/1.6 system-ui"><h1>Tu cuenta tiene acceso al asistente BOE</h1><p>Para entrar al cuaderno de electricidad necesitas la aprobación de Roberto.</p><a href="/">Volver a Agente BOE</a></main></html>', { status: 403, headers });
  }
  if (!user || path[0] === 'cuenta') {
    let html = await readFile(join(process.cwd(), 'private', 'electricidad-account.html'), 'utf8');
    html = html.replaceAll('__DESTINATION__', `/${section}`).replace('__ACCOUNT_VIEW__', user ? 'true' : 'false');
    return new Response(html, { headers });
  }
  let html = await readFile(join(process.cwd(), 'private', section, 'index.html'), 'utf8');
  // Roberto conserva el progreso previo; los demás usan claves propias en este navegador.
  if (user.role !== 'admin') html = html.replace(/KEY='(ibtb-(?:secciones-v3|exams-v2))'/g, `KEY='$1:${user.id}'`);
  const account = `<div class="account-strip" style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--line);font-size:13px"><span>Sesión de ${escape(user.username)}</span><a href="/electricidad/cuenta" style="min-height:44px;display:inline-flex;align-items:center">${user.role === 'admin' ? 'Mi cuenta y administración' : 'Mi cuenta'}</a></div>`;
  html = html.replace('<header class="header">', account + '<header class="header">');
  html = html.replace('</body>', '<script>addEventListener("pageshow",e=>{if(e.persisted)location.reload()});</script></body>');
  return new Response(html, { headers });
}

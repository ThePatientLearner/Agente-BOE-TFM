import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { NextRequest } from 'next/server';
export const SESSION_COOKIE = 'electricidad_session';
export const ELECTRICIDAD_API = process.env.API_URL ?? 'http://localhost:3001';
export const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', Vary: 'Cookie' };
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const withStudyIcon = (html: string) => html.replace('</head>', '<link rel="icon" type="image/svg+xml" sizes="any" href="/icons/electricidad.svg"></head>');

function studyAccessNotice(username: string) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Entrar al curso · Electricidad · Agente BOE</title>
<script>try{document.documentElement.dataset.theme=localStorage.getItem('electricidad-theme')==='light'?'light':'dark'}catch{document.documentElement.dataset.theme='dark'}</script>
<style>:root{color-scheme:dark;--bg:#0a111f;--paper:#101c31;--text:#ebe4d3;--muted:#a5aec0;--gold:#e7ce99;--line:#c9a86a40;--button:#e7ce99;--button-text:#101c31}html[data-theme=light]{color-scheme:light;--bg:#e4e7eb;--paper:#f1f2f4;--text:#263245;--muted:#586473;--gold:#806027;--line:#c5cbd2;--button:#263950;--button-text:#f2f0e9}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 system-ui,sans-serif;min-height:100vh}header{padding:22px max(20px,calc((100vw - 800px)/2));border-bottom:1px solid var(--line);font:24px Georgia,serif}header small{display:block;font:10px/2 system-ui;letter-spacing:.15em;color:var(--muted)}main{max-width:800px;margin:40px auto;padding:0 20px}.panel{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:clamp(22px,5vw,40px)}.eyebrow{font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--gold)}h1{font:400 clamp(2rem,5vw,3rem)/1.2 Georgia,serif;margin:18px 0}p{color:var(--muted)}strong{color:var(--text);overflow-wrap:anywhere}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:12px 18px;border:1px solid var(--line);border-radius:8px;font-weight:600;text-decoration:none;color:var(--gold)}.primary{background:var(--button);color:var(--button-text)}a:focus-visible{outline:3px solid #91cce5;outline-offset:3px}@media(max-width:500px){main{margin-top:24px}.actions a{width:100%}}</style></head>
<body><header>ϟ Agente BOE<small>ELECTRICIDAD · ÁREA DE ESTUDIO</small></header><main><section class="panel"><span class="eyebrow">Revisa tu cuenta</span><h1>Entra con tu cuenta de estudio.</h1><p>Has iniciado sesión como <strong>${escape(username)}</strong>. Esta cuenta tiene acceso al asistente BOE, pero todavía no al curso de electricidad.</p><p>Si tienes otra cuenta autorizada, entra en «Mi cuenta» y pulsa «Cerrar sesión y cambiar de cuenta». Si quieres estudiar con esta cuenta, Roberto debe aprobar su acceso.</p><div class="actions"><a class="button primary" href="/electricidad/cuenta">Mi cuenta / Cambiar de cuenta →</a><a class="button" href="/">Volver a Agente BOE</a></div></section></main></body></html>`;
}

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
  // La gestión de la propia sesión debe seguir disponible sin permiso de estudio.
  if (!user || path[0] === 'cuenta') {
    let html = await readFile(join(process.cwd(), 'private', 'electricidad-account.html'), 'utf8');
    html = html.replaceAll('__DESTINATION__', `/${section}`).replace('__ACCOUNT_VIEW__', user ? 'true' : 'false');
    return new Response(withStudyIcon(html), { headers });
  }
  // Fallar cerrado: una cuenta pública del bot no habilita el curso ni el tutor.
  if (user.role !== 'admin' && user.studyAccess !== true) {
    return new Response(withStudyIcon(studyAccessNotice(user.username)), { status: 403, headers });
  }
  let html = await readFile(join(process.cwd(), 'private', section, 'index.html'), 'utf8');
  // Roberto conserva el progreso previo; los demás usan claves propias en este navegador.
  if (user.role !== 'admin') html = html.replace(/KEY='(ibtb-(?:secciones-v3|exams-v2))'/g, `KEY='$1:${user.id}'`);
  const tutorAdmin = user.role === 'admin' && user.username.trim().toLowerCase() === 'roberto';
  const account = `<div class="account-strip"${tutorAdmin ? ' data-tutor-admin="true"' : ''} style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;padding:10px 16px;border-bottom:1px solid var(--line);font-size:13px"><span>Sesión de ${escape(user.username)}</span><a href="/electricidad/cuenta" style="min-height:44px;display:inline-flex;align-items:center">${user.role === 'admin' ? 'Mi cuenta y administración' : 'Mi cuenta'}</a></div>`;
  html = html.replace('<header class="header">', account + '<header class="header">');
  if (process.env.TFM_DEMO === 'true') html = html.replace(/<body([^>]*)>/, '<body$1><aside style="padding:12px 16px;background:#fff0bf;color:#30280e;text-align:center"><strong>DEMO LOCAL TFM</strong> · Tutor con respuestas simuladas; apuntes del curso real. Cuenta local desechable.</aside>');
  const [tutorStyle, tutorScript] = await Promise.all([
    readFile(join(process.cwd(), 'private', 'electricidad-tutor.css'), 'utf8'),
    readFile(join(process.cwd(), 'private', 'electricidad-tutor.js'), 'utf8'),
  ]);
  html = html.replace('</head>', `<style>${tutorStyle}</style></head>`);
  html = html.replace('</body>', `<script>${tutorScript}</script></body>`);
  html = html.replace('</body>', '<script>addEventListener("pageshow",e=>{if(e.persisted)location.reload()});</script></body>');
  return new Response(withStudyIcon(html), { headers });
}

'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { BotLogo, BotThinking } from './BoeBotLogo';
import { BoeBotContact } from './BoeBotContact';

type User = { username: string; role: 'admin' | 'student' };
type Bot = { id: string; label: string; enabled: boolean; selected: boolean };
type Source = { id: string; title: string; officialUrl: string; summaryUrl: string; publicationDate: string; lastOfficialUpdateAt: string };
type Message = { role: 'user' | 'assistant'; content: string; sources?: Source[]; model?: string };
function official(url: string) {
  try { const u = new URL(url); return u.protocol === 'https:' && (u.hostname === 'www.boe.es' || u.hostname === 'boe.es'); } catch { return false; }
}
function shortDate(date: string) { return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.split('-').reverse().join('/') : date; }

/**
 * Espejo de `password-policy.ts` del monolito, para avisar mientras se escribe
 * en vez de tras enviar. EL SERVIDOR ES QUIEN DECIDE: esto solo ahorra un viaje
 * de ida y vuelta, y si las dos reglas se separan manda la de allí. Está
 * duplicado porque la web y el monolito son paquetes distintos y compartir
 * código entre ellos pedía un tercer paquete para doce líneas.
 */
function passwordProblem(value: string, username?: string): string | null {
  if (value.length < 10 || value.length > 128) return 'Entre 10 y 128 caracteres.';
  if (value.trim().length < 10) return 'No puede ser casi toda espacios.';
  if (new Set(value.toLowerCase()).size <= 3) return 'Repite muy pocos caracteres distintos.';
  const nombre = (username ?? '').trim().toLowerCase();
  if (nombre.length >= 4 && value.toLowerCase().includes(nombre)) return 'No puede contener tu nombre de usuario.';
  const tipos = [/[a-záéíóúüñ]/.test(value), /[A-ZÁÉÍÓÚÜÑ]/.test(value), /\d/.test(value), /[^\p{L}\p{N}]/u.test(value)].filter(Boolean).length;
  if (value.length < 16 && tipos < 3) return 'Combina al menos tres de: minúsculas, mayúsculas, números y símbolos. O usa una frase de 16 caracteres o más.';
  return null;
}

export default function BoeBotPanel({ entryId, telegramContactUrl, onClose }: { entryId?: string; telegramContactUrl?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null), scroll = useRef<HTMLDivElement>(null);
  const pending = useRef<AbortController | null>(null);
  const [user, setUser] = useState<User | null>(null), [checking, setChecking] = useState(true);
  const [register, setRegister] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [thinking, setThinking] = useState(false);
  const [question, setQuestion] = useState(''), [messages, setMessages] = useState<Message[]>([]);
  // Solo el administrador elige la IA, y su elección vale para TODA la
  // aplicación. Para el resto `bots` se queda vacío y el selector no existe.
  const [bots, setBots] = useState<Bot[]>([]), [bot, setBot] = useState(''), [botSaved, setBotSaved] = useState('');
  const [profile, setProfile] = useState(false), [changed, setChanged] = useState(false);
  // Panel ampliado en ordenador. Se recuerda en este navegador: quien lo
  // amplía para leer mejor lo va a querer ampliado también la próxima vez.
  const [wide, setWide] = useState(false);
  useEffect(() => { try { setWide(localStorage.getItem('boe-bot-wide') === '1'); } catch { /* sin almacenamiento: tamaño normal */ } }, []);
  function toggleWide() {
    setWide(w => { const next = !w; try { localStorage.setItem('boe-bot-wide', next ? '1' : '0'); } catch { /* da igual */ } return next; });
  }
  useEffect(() => {
    dialog.current?.showModal();
    const controller = new AbortController();
    fetch('/api/account/me', { cache: 'no-store', signal: controller.signal }).then(async response => {
      if (response.ok) setUser((await response.json()).user);
      else if (response.status !== 401) setError('El acceso no está disponible ahora.');
    }).catch(e => { if (e.name !== 'AbortError') setError('No se pudo comprobar tu sesión.'); }).finally(() => setChecking(false));
    return () => { controller.abort(); pending.current?.abort(); };
  }, []);
  useEffect(() => {
    const viewport = scroll.current;
    if (!viewport) return;
    if (busy) { viewport.scrollTop = viewport.scrollHeight; return; }
    const answer = viewport.querySelector<HTMLElement>('.boe-bot-message.assistant:last-of-type');
    // Las respuestas nuevas se leen desde el principio; la bienvenida empieza por el logo.
    if (answer) viewport.scrollTop += answer.getBoundingClientRect().top - viewport.getBoundingClientRect().top - 16;
    else viewport.scrollTop = 0;
  }, [messages, busy]);
  useEffect(() => {
    if (user?.role !== 'admin') { setBots([]); setBot(''); return; }
    const controller = new AbortController();
    fetch('/api/assistant/models', { cache: 'no-store', signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => showBots(data?.models))
      // Que no se pueda listar los bots no debe impedir preguntar.
      .catch(() => {});
    return () => controller.abort();
  }, [user]);

  async function api(path: string, body: object) {
    pending.current = new AbortController();
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: pending.current.signal });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401 && path === '/api/assistant') { setUser(null); setMessages([]); }
      throw new Error(data.error ?? 'No se pudo completar la operación.');
    }
    return data;
  }
  async function authenticate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get('username') ?? '').trim(), password = String(form.get('password') ?? '');
    if (register && password !== form.get('confirm')) { setError('Las contraseñas no coinciden.'); return; }
    setBusy(true); setError('');
    try {
      if (register) await api('/api/account/register', { username, password, code: String(form.get('code') ?? '') });
      const data = await api('/api/account/login', { username, password });
      setUser(data.user);
    } catch (e) { if ((e as Error).name !== 'AbortError') setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function ask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = question.trim();
    if (text.length < 2 || busy) return;
    setBusy(true); setThinking(true); setError('');
    try {
      const data = await api('/api/assistant', { question: text, ...(entryId ? { entryId } : {}), history: messages.slice(-4).map(m => ({ role: m.role, content: m.content.slice(0, 1000) })) });
      setMessages(previous => [...previous, { role: 'user', content: text } as Message, { role: 'assistant', content: data.answer, sources: data.sources, ...(user?.role === 'admin' && typeof data.model === 'string' ? { model: data.model } : {}) } as Message].slice(-16));
      setQuestion('');
    } catch (e) { if ((e as Error).name !== 'AbortError') setError((e as Error).message); }
    finally { setBusy(false); setThinking(false); }
  }
  function showBots(models: Bot[] | undefined) {
    const available = (models ?? []).filter(m => m.enabled);
    setBots(available);
    setBot(available.find(m => m.selected)?.id ?? available[0]?.id ?? '');
  }
  async function chooseBot(id: string) {
    const previous = bot;
    setBot(id); setBusy(true); setError(''); setBotSaved('');
    try {
      const response = await fetch('/api/assistant/models', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'No se ha podido guardar.');
      showBots(data.models);
      setBotSaved('Guardado: responde a todos los usuarios.');
    } catch (e) { setBot(previous); setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const current = String(form.get('current') ?? ''), next = String(form.get('next') ?? '');
    if (next !== form.get('repeat')) { setError('Las contraseñas nuevas no coinciden.'); return; }
    const problem = passwordProblem(next, user?.username);
    if (problem) { setError(problem); return; }
    setBusy(true); setError('');
    try {
      await api('/api/account/password', { current, password: next });
      // El servidor cierra TODAS las sesiones al cambiarla, así que no se
      // puede seguir usando el bot: se vuelve al acceso diciendo por qué.
      setChanged(true); setProfile(false); setUser(null); setMessages([]); setQuestion('');
    } catch (e) { if ((e as Error).name !== 'AbortError') setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError('');
    try { await api('/api/account/logout', {}); setUser(null); setMessages([]); setQuestion(''); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  return <dialog ref={dialog} className={`boe-bot-dialog${wide ? ' boe-bot-wide' : ''}${thinking ? ' boe-bot-is-thinking' : ''}`} aria-labelledby="boe-bot-title" onCancel={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }}>
    <div className="boe-bot-shell">
      <header className="boe-bot-header"><div className="boe-bot-mark"><BotLogo /></div><div><h2 id="boe-bot-title">BoeBot</h2><span>Pregunta. Entiende. Consulta la fuente.</span></div><button type="button" className="boe-bot-expand" onClick={toggleWide} aria-pressed={wide} aria-label={wide ? 'Reducir el asistente' : 'Ampliar el asistente'} title={wide ? 'Reducir' : 'Ampliar'}>{wide ? '⤡' : '⤢'}<span>{wide ? 'Reducir' : 'Ampliar'}</span></button><button type="button" className="boe-bot-close" autoFocus onClick={onClose} aria-label="Cerrar asistente">×</button></header>
      <div className="boe-bot-context"><span className="boe-bot-dot" />{entryId ? <>Sobre esta disposición <strong>{entryId}</strong></> : 'Consulta nuestro archivo de disposiciones'}</div>
      {checking ? <p className="boe-bot-loading" role="status">Comprobando tu sesión…</p> : !user ? <div className="boe-bot-auth">
        {changed && <p className="boe-bot-done" role="status">Contraseña cambiada. Por seguridad se han cerrado todas tus sesiones: entra de nuevo con la contraseña nueva.</p>}
        <div className="boe-bot-auth-layout">
          <section className="boe-bot-intro" aria-labelledby="boe-bot-intro-title">
            <div className="boe-bot-welcome-logo" aria-hidden="true"><span className="boe-bot-particles">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</span><BotLogo expressive /></div>
            <h3 id="boe-bot-intro-title">El BOE, un poco más claro.</h3>
            <p>Pregunta qué cambia, a quién afecta o qué plazos debes tener en cuenta. Consulta las fuentes oficiales junto a cada respuesta.</p>
          </section>
          <div className="boe-bot-access">
        <h3>{register ? 'Crea tu cuenta.' : 'Entra y pregunta.'}</h3>
        <p className="boe-bot-auth-description">{register ? 'Para registrarte necesitas la contraseña de registro, además de una contraseña personal para tu cuenta.' : 'Accede con tu usuario y contraseña.'} Dispones de 5 consultas al día.</p>
        <div className="boe-bot-auth-tabs"><button type="button" aria-pressed={!register} disabled={busy} onClick={() => { setRegister(false); setError(''); }}>Entrar</button><button type="button" aria-pressed={register} disabled={busy} onClick={() => { setRegister(true); setError(''); }}>Crear cuenta</button></div>
        <form onSubmit={authenticate} key={String(register)}>
          {register && <><label htmlFor="bot-registration-code">Contraseña de registro</label><input id="bot-registration-code" name="code" type="password" autoComplete="off" aria-describedby="bot-registration-help" required maxLength={128} disabled={busy} /><p id="bot-registration-help" className="boe-bot-fine">Necesitas conocerla para crear tu cuenta.</p></>}
          <label htmlFor="bot-username">Nombre de usuario</label><input id="bot-username" name="username" autoComplete="username" required minLength={3} maxLength={40} disabled={busy} />
          <label htmlFor="bot-password">{register ? 'Contraseña de tu cuenta' : 'Contraseña'}</label><input id="bot-password" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 8 : 1} maxLength={128} disabled={busy} />
          {register && <><label htmlFor="bot-confirm">Repite la contraseña</label><input id="bot-confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128} disabled={busy} /></>}
          <button className="boe-bot-primary" disabled={busy}>{busy ? 'Un momento…' : register ? 'Crear cuenta y entrar' : 'Entrar al asistente'}</button>
        </form>
        <p className="boe-bot-fine">Tus preguntas se envían a MiniMax, nuestro proveedor de IA. Evita datos personales. <a href="/privacidad">Privacidad</a>.</p>
          </div>
          <BoeBotContact telegramUrl={telegramContactUrl} featured />
        </div>
      </div> : <>
        <div className="boe-bot-account"><span>Hola, {user.username}</span><button type="button" disabled={busy} onClick={() => { setMessages([]); setQuestion(''); setError(''); }}>Nueva consulta</button><button type="button" aria-pressed={profile} disabled={busy} onClick={() => { setProfile(p => !p); setError(''); }}>Editar perfil</button><button type="button" disabled={busy} onClick={logout}>Salir</button></div>
        <div className="boe-bot-quota">{user.role === 'admin' ? 'Administrador · Consultas ilimitadas' : '5 consultas al día · Se renuevan a medianoche (Madrid)'}</div>
        {user.role === 'admin' && bots.length > 1 && <div className="boe-bot-model">
          <label htmlFor="bot-model">IA para toda la web</label>
          <select id="bot-model" value={bot} disabled={busy} onChange={e => void chooseBot(e.target.value)}>
            {bots.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
          {botSaved && <span className="boe-bot-model-saved" role="status">{botSaved}</span>}
        </div>}
        {profile && <form className="boe-bot-profile" onSubmit={changePassword}>
          <h3>Cambiar la contraseña</h3>
          <p className="boe-bot-profile-help">Al menos 10 caracteres, combinando tres de estos cuatro: minúsculas, mayúsculas, números y símbolos. Una frase de 16 caracteres o más vale por sí sola y es más fácil de recordar.</p>
          <label htmlFor="bot-current">Contraseña actual</label><input id="bot-current" name="current" type="password" autoComplete="current-password" required maxLength={128} disabled={busy} />
          <label htmlFor="bot-next">Contraseña nueva</label><input id="bot-next" name="next" type="password" autoComplete="new-password" required minLength={10} maxLength={128} disabled={busy} />
          <label htmlFor="bot-repeat">Repite la nueva</label><input id="bot-repeat" name="repeat" type="password" autoComplete="new-password" required minLength={10} maxLength={128} disabled={busy} />
          <p className="boe-bot-profile-help">Al guardarla se cerrarán todas tus sesiones y tendrás que entrar otra vez.</p>
          <div className="boe-bot-profile-actions">
            <button type="button" disabled={busy} onClick={() => { setProfile(false); setError(''); }}>Cancelar</button>
            <button className="boe-bot-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar contraseña'}</button>
          </div>
        </form>}
        <div className="boe-bot-messages" ref={scroll} role="log" aria-label="Conversación" aria-live="polite" aria-busy={busy}>
          {!messages.length && <div className="boe-bot-welcome">
            <div className="boe-bot-welcome-logo" aria-hidden="true"><span className="boe-bot-particles">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</span><BotLogo expressive /></div>
            <h3>{entryId ? 'Leemos esta disposición contigo.' : 'El BOE, un poco más claro.'}</h3><p>{entryId ? 'Tus preguntas se referirán al documento que tienes abierto.' : 'Busca por tema, fecha o número de disposición.'}</p><div className="boe-bot-suggestions">{(entryId ? ['¿A quién afecta?', '¿Qué cambia?', '¿Qué plazos establece?', '¿Sigue vigente o ha sido derogada?'] : ['¿Qué se ha publicado hoy?', '¿Hay novedades sobre pensiones?', 'Busca disposiciones sobre vivienda', '¿Cómo sé si una norma ha sido derogada?']).map(text => <button key={text} type="button" onClick={() => setQuestion(text)}>{text}</button>)}</div>
          </div>}
          {messages.map((m, index) => <article className={`boe-bot-message ${m.role}`} key={index}><span className="boe-bot-message-label">{m.role === 'user' ? 'Tú' : 'Asistente · respuesta generada por IA'}</span>
            {!!m.sources?.length && <details className="boe-bot-sources" open><summary>Fuentes oficiales ({m.sources.length})</summary><ol>{m.sources.map(source => <li key={source.id}>
              {official(source.officialUrl) && <a href={source.officialUrl} target="_blank" rel="noopener noreferrer">BOE · {source.id} ↗</a>}
              <span>{source.title}</span><small>Publicado: {shortDate(source.publicationDate)} · Actualización registrada: {shortDate(source.lastOfficialUpdateAt)}</small>
              <a href={`/d/${source.id}`} className="boe-bot-source-summary">Ver ficha y resumen de IA</a>
            </li>)}</ol></details>}
            <p className="boe-bot-answer">{m.content}</p>
            {user.role === 'admin' && m.model && <p className="boe-bot-answer-model">Modelo usado: {m.model} · solo lo ves tú (administrador)</p>}
            {/* Al cliente, en el mismo sitio, el aviso de LEGAL.md §1.6 resumido. Solo
                en respuestas de la IA (llevan fuentes); los avisos fijos no lo necesitan. */}
            {user.role !== 'admin' && !!m.sources?.length && <p className="boe-bot-answer-disclaimer">Respuesta generada por IA, solo informativa: puede contener errores u omisiones, no es asesoramiento jurídico ni sustituye al texto oficial, y no respondemos de decisiones tomadas con ella. Si es importante, repite la pregunta para contrastar y comprueba siempre la fuente oficial. <a href="/legal">Aviso legal</a></p>}
          </article>)}
          {busy && <p className="boe-bot-thinking" role="status"><BotThinking />Consultando el archivo…</p>}
        </div>
        <form className="boe-bot-compose" onSubmit={ask}><label className="boe-bot-sr-only" htmlFor="bot-question">Tu pregunta sobre el BOE</label><textarea id="bot-question" value={question} onChange={e => setQuestion(e.target.value)} maxLength={800} rows={2} required minLength={2} placeholder={entryId ? 'Pregunta sobre esta disposición…' : '¿Qué quieres saber del BOE?'} disabled={busy} /><button className="boe-bot-send" type="submit" disabled={busy || question.trim().length < 2} aria-label="Enviar pregunta">↑</button></form>
        <p className="boe-bot-footer-note">IA · Servicio no oficial. Solo el texto del BOE tiene validez legal. Preguntas y contexto breve enviados a MiniMax.</p>
      </>}
      {error && <p className="boe-bot-error" role="alert">{error}</p>}
    </div>
  </dialog>;
}

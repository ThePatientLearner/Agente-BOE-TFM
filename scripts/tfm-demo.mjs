import { spawn } from 'node:child_process';
import { cp, mkdtemp, mkdir, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] ?? 'all';
if (!['all', 'api', 'web'].includes(mode)) throw new Error('Modo de demo desconocido.');
// Una lista permitida evita heredar credenciales, DATABASE_URL o NODE_OPTIONS.
// Next carga .env por sí mismo: por eso la web se ejecuta en una copia temporal.
const env = Object.fromEntries(['PATH', 'HOME', 'USERPROFILE', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'TMPDIR', 'LANG', 'TERM']
  .filter(key => process.env[key]).map(key => [key, process.env[key]]));
Object.assign(env, { NODE_ENV: 'development', TFM_DEMO: 'true', API_URL: 'http://127.0.0.1:3101', NEXT_TELEMETRY_DISABLED: '1' });
const children = new Set();
let temporary, closing = false;
async function close(code = 0) {
  if (closing) return;
  closing = true;
  const running = [...children];
  for (const child of running) child.kill('SIGTERM');
  await Promise.all(running.map(child => child.exitCode !== null ? Promise.resolve() : new Promise(resolve => {
    const timeout = setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 4000);
    child.once('exit', () => { clearTimeout(timeout); resolve(); });
  })));
  if (temporary) await rm(temporary, { recursive: true, force: true });
  process.exit(code);
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => void close());
function start(args, cwd) {
  const child = spawn(process.execPath, args, { cwd, env, stdio: 'inherit' });
  children.add(child);
  child.on('error', error => { console.error(error.message); void close(1); });
  child.on('exit', code => { children.delete(child); if (!closing) void close(code ?? 1); });
  return child;
}
async function prepareWeb() {
  temporary = await mkdtemp(join(tmpdir(), 'agente-boe-tfm-'));
  const web = join(temporary, 'web');
  await mkdir(web);
  const source = join(root, 'apps/web');
  for (const name of ['src', 'private', 'public', 'package.json', 'tsconfig.json', 'next.config.ts', 'next-env.d.ts']) {
    await cp(join(source, name), join(web, name), { recursive: true, filter: path => {
      const parts = relative(source, path).split('/');
      return !parts.some(part => part.startsWith('.env')) && !(parts[0] === 'public' && ['cv', 'tfm'].includes(parts[1]));
    } });
  }
  await symlink(join(root, 'node_modules'), join(temporary, 'node_modules'), 'dir');
  await symlink(join(source, 'node_modules'), join(web, 'node_modules'), 'dir');
  return web;
}
try {
  if (mode !== 'web') {
    start([join(root, 'node_modules/tsx/dist/cli.mjs'), join(root, 'apps/monolith/src/cli/tfm-demo.ts')], root);
    if (mode === 'all') {
      let ready = false;
      for (let attempt = 0; attempt < 80 && !closing; attempt++) {
        try {
          const response = await fetch('http://127.0.0.1:3101/api/tfm-demo', { signal: AbortSignal.timeout(500) });
          ready = response.ok && (await response.json()).provider === 'simulated';
        } catch {}
        if (ready) break;
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      if (!ready) throw new Error('La API demo no ha arrancado en 127.0.0.1:3101.');
    }
  }
  if (mode !== 'api' && !closing) {
    const web = await prepareWeb();
    start([join(root, 'node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', '3100'], web);
    console.log('Demo TFM web: http://127.0.0.1:3100 · datos de ejemplo y proveedor simulado.');
  }
} catch (error) { console.error(error.message); await close(1); }

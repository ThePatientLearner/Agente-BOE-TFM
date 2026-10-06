import { buildTfmDemoServer, DEMO_USERNAME, DEMO_PASSWORD } from '../demo/tfm-server.js';

if (process.env.TFM_DEMO !== 'true') throw new Error('Utiliza npm run demo:api para iniciar la demo aislada.');
const server = buildTfmDemoServer();
await server.listen({ host: '127.0.0.1', port: 3101 });
console.log(`Demo TFM API: http://127.0.0.1:3101 · cuenta local ${DEMO_USERNAME} / ${DEMO_PASSWORD}`);
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, async () => { await server.close(); process.exit(0); });

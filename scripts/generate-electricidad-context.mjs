import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'apps/web/private/electricidad/index.html');
const target = resolve(root, 'apps/monolith/src/modules/assistant/infrastructure/electricidad-course.ts');
const html = await readFile(source, 'utf8');
const json = html.match(/<script\s+id="data"\s+type="application\/json">([\s\S]*?)<\/script>/)?.[1];
if (!json) throw new Error('No se encuentra el banco del curso.');
const bank = JSON.parse(json);
function plain(value) {
  return String(value ?? '').replace(/<\/(?:td|th)>/gi, ' | ').replace(/<\/tr>/gi, '\n')
    .replace(/<\/(?:p|li|h[1-6]|div)>|<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)))
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' })[entity])
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}
const course = {
  updatedAt: /^\d{4}-\d{2}-\d{2}$/.test(bank.date) ? bank.date : '',
  sections: bank.sections.map(section => ({
    id: section.id, title: plain(section.title), cards: section.cards.map(card => ({
      id: card.id, title: plain(card.title), text: [card.key, card.body, card.takeaway && `Idea clave: ${card.takeaway}`, card.recall?.answer && `Comprobación: ${card.recall.answer}`, card.trap && `Confusión frecuente: ${card.trap}`].map(plain).filter(Boolean).join('\n'),
      references: (card.refs ?? []).filter(ref => typeof ref.label === 'string' && typeof ref.url === 'string').map(ref => ({ label: plain(ref.label), url: ref.url })),
    })),
  })),
};
const ids = course.sections.map(section => section.id);
const cardIds = course.sections.flatMap(section => section.cards.map(card => card.id));
if (new Set(ids).size !== ids.length || !course.sections.length || course.sections.some(section => !section.cards.length)) throw new Error('Banco de curso incompleto o con apartados duplicados.');
if (ids.includes('all') || [...ids, ...cardIds].some(id => !/^[a-z0-9_-]{1,64}$/.test(id)) || new Set(cardIds).size !== cardIds.length) throw new Error('Los identificadores del curso deben ser únicos y compatibles con el tutor.');
await writeFile(target, `// Generado desde el curso privado por scripts/generate-electricidad-context.mjs.\n// Regenerar tras modificar el temario. Sin preguntas, usuarios ni secretos.\nimport type { StudyCourse } from '../domain/study-course.js';\n\nexport const electricidadCourse: StudyCourse = ${JSON.stringify(course, null, 2)};\n`, 'utf8');
console.log(`Contexto generado: ${course.sections.length} apartados, ${course.sections.reduce((n, s) => n + s.cards.length, 0)} fichas.`);

import { unstable_cache } from "next/cache";
import { MAX_FEED_BYTES, MAX_HEADLINE_AGE_MS, parsePressFeed, PRESS_SOURCES, type PressSource } from "./press-feed";
import { PRESS_REFRESH_MS, pressRefreshDelay } from "./press-refresh";

/** Una consulta por medio cada 10 minutos, compartida por todos los visitantes.
 * Los errores se lanzan dentro de la caché para conservar el último éxito.
 * Un error de un periódico nunca bloquea al otro ni al catálogo del BOE. */
const fetchSource = unstable_cache(async (source: PressSource) => {
  const response = await fetch(source.feed, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
  });
  if (!response.ok || !response.body) throw new Error(`RSS ${source.id}: ${response.status}`);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_FEED_BYTES) throw new Error(`RSS ${source.id}: tamaño excedido`);
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const checkedAt = new Date().toISOString();
  const headline = parsePressFeed(Buffer.concat(chunks).toString("utf8"), source.host, Date.parse(checkedAt));
  if (!headline) throw new Error(`RSS ${source.id}: sin titular reciente válido`);
  return { headline, checkedAt };
}, ["press-sections-v2"], { revalidate: PRESS_REFRESH_MS / 1000 });

export async function fetchPressHeadlines() {
  return Promise.all(PRESS_SOURCES.map(async (source) => {
    try {
      const result = await fetchSource(source);
      if (Date.now() - Date.parse(result.headline.publishedAt) > MAX_HEADLINE_AGE_MS) {
        return { source, headline: null, checkedAt: null };
      }
      return { source, ...result };
    } catch {
      return { source, headline: null, checkedAt: null };
    }
  }));
}

export async function fetchPressSnapshot() {
  const headlines = await fetchPressHeadlines();
  return { headlines, refreshAfterMs: pressRefreshDelay(headlines.map((item) => item.checkedAt), Date.now()) };
}

export type PressSnapshot = Awaited<ReturnType<typeof fetchPressSnapshot>>;

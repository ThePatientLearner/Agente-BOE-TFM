import { XMLParser, XMLValidator } from "fast-xml-parser";

export const PRESS_SOURCES = [
  { id: "elpais", name: "EL PAÍS", section: "espana", label: "España", home: "https://elpais.com/espana/", host: "elpais.com",
    feed: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/portada" },
  { id: "abc", name: "ABC", section: "espana", label: "España", home: "https://www.abc.es/espana/", host: "abc.es",
    feed: "https://www.abc.es/rss/2.0/espana/" },
  { id: "bbc", name: "BBC Mundo", section: "internacional", label: "Edición en español", home: "https://www.bbc.com/mundo", host: "bbc.com",
    feed: "https://feeds.bbci.co.uk/mundo/rss.xml" },
  { id: "france24", name: "France 24", section: "internacional", label: "Edición en español", home: "https://www.france24.com/es/", host: "france24.com",
    feed: "https://www.france24.com/es/rss" },
] as const;

export type PressSource = (typeof PRESS_SOURCES)[number];
export type PressHeadline = { title: string; url: string; publishedAt: string };
export const MAX_FEED_BYTES = 1_000_000;
export const MAX_HEADLINE_AGE_MS = 72 * 60 * 60 * 1000;

/** Solo texto y enlace: nunca reproducimos el artículo, fotos o HTML del medio. */
export function parsePressFeed(xml: string, host: string, now: number): PressHeadline | null {
  if (Buffer.byteLength(xml, "utf8") > MAX_FEED_BYTES || /<!DOCTYPE|<!ENTITY/i.test(xml)) return null;
  if (XMLValidator.validate(xml) !== true) return null;
  const parsed = new XMLParser({ ignoreAttributes: true, parseTagValue: false }).parse(xml);
  const items = parsed?.rss?.channel?.item;
  if (!items) return null;
  for (const item of Array.isArray(items) ? items : [items]) {
    if (typeof item.title !== "string" || typeof item.link !== "string" || typeof item.pubDate !== "string") continue;
    const date = Date.parse(item.pubDate);
    if (!Number.isFinite(date) || now - date > MAX_HEADLINE_AGE_MS || date > now + 5 * 60 * 1000) continue;
    let url: URL;
    try { url = new URL(item.link.trim()); } catch { continue; }
    if (url.protocol !== "https:" || ![host, `www.${host}`].includes(url.hostname) || url.username || url.password || url.port || url.pathname === "/") continue;
    const clean = item.title.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) continue;
    // Extracto breve, mismo límite para los dos medios y sin reescribir el titular.
    const words = clean.split(" ");
    const title = words.slice(0, 24).join(" ") + (words.length > 24 ? "…" : "");
    return { title, url: url.href, publishedAt: new Date(date).toISOString() };
  }
  return null;
}

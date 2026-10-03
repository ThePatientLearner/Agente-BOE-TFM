import { describe, expect, it } from "vitest";
import { MAX_FEED_BYTES, parsePressFeed, PRESS_SOURCES } from "./press-feed";

const now = Date.parse("2026-09-26T12:00:00Z");
const item = (title: string, link = "https://elpais.com/espana/noticia.html", date = "Sat, 26 Sep 2026 11:00:00 GMT") =>
  `<item><title>${title}</title><link>${link}</link><pubDate>${date}</pubDate></item>`;
const rss = (items: string) => `<?xml version="1.0"?><rss version="2.0"><channel>${items}</channel></rss>`;

describe("titulares de España e Internacional", () => {
  it("ofrece dos medios distintos por pestaña y fuentes nacionales para España", () => {
    for (const section of ["espana", "internacional"]) {
      const sources = PRESS_SOURCES.filter((source) => source.section === section);
      expect(sources).toHaveLength(2);
      expect(new Set(sources.map((source) => source.host)).size).toBe(2);
      expect(sources.every((source) => new URL(source.feed).protocol === "https:")).toBe(true);
    }
    expect(new Set(PRESS_SOURCES.map((source) => source.id)).size).toBe(4);
    expect(PRESS_SOURCES.filter((source) => source.section === "espana")
      .every((source) => source.feed.includes("espana"))).toBe(true);
  });
  it("respeta el orden del medio, aunque otra noticia sea más reciente", () => {
    const result = parsePressFeed(rss(item("Primero") + item("Segundo", undefined, "Sat, 26 Sep 2026 11:30:00 GMT")), "elpais.com", now);
    expect(result?.title).toBe("Primero");
    expect(result?.publishedAt).toBe("2026-09-26T11:00:00.000Z");
  });
  it("lee también un único item, CDATA y entidades XML sin conservar HTML", () => {
    expect(parsePressFeed(rss(item("<![CDATA[<b>Una noticia</b> de hoy]]>")), "elpais.com", now)?.title).toBe("Una noticia de hoy");
    expect(parsePressFeed(rss(item("Una noticia &amp; otra")), "elpais.com", now)?.title).toBe("Una noticia & otra");
  });
  it("usa el mismo máximo de 24 palabras para los cuatro medios", () => {
    const title = Array.from({ length: 30 }, (_, i) => `palabra${i}`).join(" ");
    for (const { host } of PRESS_SOURCES) {
      const result = parsePressFeed(rss(item(title, `https://www.${host}/noticia.html`)), host, now);
      expect(result?.title.split(" ")).toHaveLength(24);
      expect(result?.title.endsWith("…")).toBe(true);
    }
  });
  it.each([
    ["bbc.com", "https://www.bbc.com/mundo/articles/ejemplo?at_medium=RSS"],
    ["france24.com", "https://www.france24.com/es/europa/20260926-noticia"],
  ])("acepta la edición española de %s y conserva su enlace original", (host, link) => {
    const result = parsePressFeed(rss(item("Un titular internacional en español", link)), host, now);
    expect(result?.title).toBe("Un titular internacional en español");
    expect(result?.url).toBe(link);
    expect(parsePressFeed(rss(item("Dominio ajeno", `https://${host}.ejemplo.com/noticia`)), host, now)).toBeNull();
  });
  it("descarta feeds abandonados en vez de presentar noticias viejas como actuales", () => {
    expect(parsePressFeed(rss(item("Vieja", undefined, "Tue, 11 Apr 2023 11:00:00 GMT")), "elpais.com", now)).toBeNull();
    expect(parsePressFeed(rss(item("Futura", undefined, "Sun, 27 Sep 2026 11:00:00 GMT")), "elpais.com", now)).toBeNull();
    expect(parsePressFeed(rss(item("Sin fecha", undefined, "desconocida")), "elpais.com", now)).toBeNull();
  });
  it.each(["javascript:alert(1)", "https://elpais.com.ejemplo.com/noticia", "https://otro.com/noticia", "http://elpais.com/noticia", "https://elpais.com/", "https://clave@elpais.com/noticia", "https://elpais.com:444/noticia"])("descarta enlaces no autorizados: %s", (url) => {
    expect(parsePressFeed(rss(item("Titular", url)), "elpais.com", now)).toBeNull();
  });
  it("salta entradas incompletas y no acepta RSS mal formado, DTD o tamaño excesivo", () => {
    expect(parsePressFeed(rss("<item><title>Incompleta</title></item>" + item("Válida")), "elpais.com", now)?.title).toBe("Válida");
    expect(parsePressFeed("<rss><channel>", "elpais.com", now)).toBeNull();
    expect(parsePressFeed('<!DOCTYPE rss [<!ENTITY file SYSTEM "file:///etc/passwd">]>' + rss(item("&file;")), "elpais.com", now)).toBeNull();
    expect(parsePressFeed(rss(item("x".repeat(MAX_FEED_BYTES))), "elpais.com", now)).toBeNull();
  });
});

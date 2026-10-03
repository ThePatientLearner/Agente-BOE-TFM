const STOP = new Set(('que quien como cuando donde cual cuales el la los las un una unos unas de del al a en por para con sin sobre y o es son se me te mi tu su sus este esta esto ese esa eso estos estas esos esas lo le les hay ha han he tengo tiene tienen puedo puedes puede dame dime explica explicar explicame quiero necesito saber buscar busca encontrar informacion respecto segun ultimo ultimos ultima ultimas reciente recientes novedades nuevo nueva nuevos nuevas hoy ayer manana dia dias boe boletin decreto ley disposicion disposiciones resumen resumenes favor gracias publicado publicada publicados publicadas publica publicar trae').split(' '));

/** El modelo no formula consultas SQL ni necesita una llamada para buscar. */
export function searchTerms(query: string): string[] {
  const words = query.replace(/\b\d{4}-\d{2}-\d{2}\b/g, '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
  return [...new Set(words.filter(word => !STOP.has(word)))].slice(0, 10);
}

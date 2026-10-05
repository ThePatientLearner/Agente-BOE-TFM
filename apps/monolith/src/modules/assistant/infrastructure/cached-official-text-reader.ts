import { BoeId } from '../../../shared/domain/boe-id.js';
import type { OfficialTextReader } from '../domain/assistant.js';

/** Caché de documentos públicos: ni preguntas, ni sesiones, ni respuestas. */
export class CachedOfficialTextReader implements OfficialTextReader {
  private readonly cache = new Map<string, { text: string; expires: number }>();
  private readonly pending = new Map<string, Promise<string | null>>();
  constructor(private readonly load: (id: string) => Promise<string | null>, private readonly ttl = 15 * 60_000) {}

  async read(id: string): Promise<string | null> {
    if (!BoeId.create(id).ok) return null;
    const cached = this.cache.get(id);
    if (cached && cached.expires > Date.now()) return cached.text;
    const existing = this.pending.get(id);
    if (existing) return existing;
    const read = this.load(id).then(text => {
      if (text?.trim()) {
        // Acotar memoria incluso si se abren muchas fichas de normas enormes.
        this.cache.delete(id);
        if (text.length <= 1_000_000) this.cache.set(id, { text, expires: Date.now() + this.ttl });
        while (this.cache.size > 12) this.cache.delete(this.cache.keys().next().value!);
      }
      return text;
    }).finally(() => this.pending.delete(id));
    this.pending.set(id, read);
    return read;
  }
}

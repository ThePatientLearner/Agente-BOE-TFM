import type { NextRequest } from 'next/server';

/** Next dev normaliza la IP de loopback a localhost en nextUrl. La excepción
 * solo existe en la demo y conserva la comprobación estricta de Host y Origin. */
export function hasAllowedOrigin(request: NextRequest): boolean {
  const expected = process.env.TFM_DEMO === 'true' && request.headers.get('host') === '127.0.0.1:3100'
    ? 'http://127.0.0.1:3100'
    : request.nextUrl.origin;
  return request.headers.get('origin') === expected;
}

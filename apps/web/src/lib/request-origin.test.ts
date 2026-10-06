import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { hasAllowedOrigin } from './request-origin';

afterEach(() => vi.unstubAllEnvs());
describe('origen de la demo local', () => {
  it.each([
    ['true', '127.0.0.1:3100', 'http://127.0.0.1:3100', true],
    ['true', '127.0.0.1:3100', 'https://ajeno.invalid', false],
    ['true', 'ajeno.invalid', 'http://127.0.0.1:3100', false],
    ['false', '127.0.0.1:3100', 'http://127.0.0.1:3100', false],
  ])('demo=%s host=%s origin=%s → %s', (demo, host, origin, expected) => {
    vi.stubEnv('TFM_DEMO', demo);
    const request = new NextRequest('http://localhost:3100/api/account/login', { headers: { host, origin } });
    expect(hasAllowedOrigin(request)).toBe(expected);
  });
});

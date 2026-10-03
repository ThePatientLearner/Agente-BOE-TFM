import type { NextRequest } from 'next/server';
import { serveElectricidad } from '@/lib/electricidad-auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return serveElectricidad(request, "electricidad", (await context.params).path);
}

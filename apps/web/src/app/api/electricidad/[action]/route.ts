import { createAccountProxy } from '@/lib/account-proxy';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = createAccountProxy('electricidad');
export const POST = GET;

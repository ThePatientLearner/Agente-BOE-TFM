import { createAccountProxy } from '@/lib/account-proxy';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = createAccountProxy('account');
export const POST = GET;

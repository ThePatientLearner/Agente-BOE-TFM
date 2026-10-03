'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BotLogo } from './BoeBotLogo';

const BotPanel = dynamic(() => import('./BoeBotPanel'), { ssr: false });

export default function BoeBot({ telegramContactUrl }: { telegramContactUrl?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  if (pathname !== '/' && !/^\/d\/BOE-[A-Z]-\d{4}-\d{1,6}$/.test(pathname)) return null;
  const entryId = pathname.startsWith('/d/') ? pathname.slice(3) : undefined;
  return <>
    <button type="button" className="boe-bot-launcher" onClick={() => setOpen(true)} aria-label="Abrir asistente BOE" aria-haspopup="dialog" aria-expanded={open}>
      <span className="boe-bot-launcher-icon"><span className="boe-bot-particles" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</span><BotLogo /></span><span className="boe-bot-label">BoeBot</span>
    </button>
    {open && <BotPanel key={pathname} entryId={entryId} telegramContactUrl={telegramContactUrl} onClose={() => setOpen(false)} />}
  </>;
}

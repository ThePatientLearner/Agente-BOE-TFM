import Link from "next/link";

export function GamePromo() {
  return (
    <aside className="game-promo">
      <img src="/juego/cara.png" alt="" width={64} height={64} loading="lazy" />
      <div><p className="eyebrow">Una pausa entre lecturas</p><h2>¿Te quedan dos minutos?</h2><p>Prueba el juego de Agente BOE. Directamente en el navegador.</p></div>
      <Link href="/juego" className="text-link" data-engagement="game_open">Descubrir el juego <span aria-hidden="true">→</span></Link>
    </aside>
  );
}

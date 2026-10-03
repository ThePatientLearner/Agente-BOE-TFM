export function BotLogo({ expressive = false, thinking = false }: { expressive?: boolean; thinking?: boolean } = {}) {
  const className = thinking ? 'boe-bot-logo-thinking' : expressive ? 'boe-bot-logo-expressive' : undefined;
  return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className}>
    <g className="boe-bot-head">
      <path d="M24 8v5" stroke="currentColor" strokeWidth="2" /><circle cx="24" cy="6" r="3" fill="currentColor" />
      <rect x="9" y="14" width="30" height="24" rx="9" stroke="currentColor" strokeWidth="2" />
      <path d="M5 23v8m38-8v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <g className="boe-bot-gaze">
        <g className="boe-bot-eyes"><rect x="16" y="22" width="4" height="5" rx="2" fill="currentColor" /><rect x="28" y="22" width="4" height="5" rx="2" fill="currentColor" /></g>
        <path d="M19 32h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  </svg>;
}

/** Las tres órbitas, inclinadas 0°, 60° y 120° como en el dibujo clásico del átomo. */
const ORBITS = [
  { tilt: 0, seconds: 1.5, electron: '#e9cd96' },
  { tilt: 60, seconds: 1.9, electron: '#91c6df' },
  { tilt: 120, seconds: 2.3, electron: '#e9cd96' },
] as const;
// Elipse de 46×16 alrededor del centro (50,50), recorrida entera.
const ORBIT_PATH = 'M4,50 a46,16 0 1,0 92,0 a46,16 0 1,0 -92,0';

function Orbits({ front }: { front: boolean }) {
  return <svg viewBox="0 0 100 100" className={`boe-bot-atom-orbits${front ? ' boe-bot-atom-front' : ''}`} aria-hidden="true">
    {ORBITS.map(({ tilt, seconds, electron }) => <g key={tilt} transform={`rotate(${tilt} 50 50)`}>
      <ellipse cx="50" cy="50" rx="46" ry="16" className="boe-bot-atom-orbit" />
      <circle r="3.4" fill={electron} className="boe-bot-atom-electron">
        <animateMotion dur={`${seconds}s`} repeatCount="indefinite" path={ORBIT_PATH} />
      </circle>
    </g>)}
  </svg>;
}

/**
 * El robot mientras la IA trabaja: lee moviendo los ojos y tiene tres
 * electrones orbitándole. Las órbitas se pintan dos veces —entera detrás del
 * robot y solo la mitad inferior delante— para que pasen POR DELANTE y POR
 * DETRÁS de él, como un átomo visto en perspectiva. Los electrones de las dos
 * capas coinciden en posición, así que se ve uno solo.
 */
export function BotThinking() {
  return <span className="boe-bot-atom" aria-hidden="true">
    <Orbits front={false} />
    <BotLogo thinking />
    <Orbits front />
  </span>;
}

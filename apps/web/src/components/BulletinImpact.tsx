import type { CatalogEntry } from "@/lib/api";

const LEVELS = [
  { impact: 5, label: "Muy alto", color: "#e0483f" },
  { impact: 4, label: "Alto", color: "#e8873a" },
  { impact: 3, label: "Amplio", color: "#f0c22e" },
  { impact: 2, label: "Reducido", color: "#9bbf4a" },
  { impact: 1, label: "Trámite", color: "#4fa96a" },
];

/** El anillo y la leyenda cuentan las mismas disposiciones del boletín. */
export function BulletinImpact({ entries }: { entries: CatalogEntry[] }) {
  const total = entries.length;
  const levels = LEVELS.map((level) => ({ ...level, count: entries.filter((entry) => entry.impact === level.impact).length }));
  const pending = total - levels.reduce((sum, level) => sum + level.count, 0);
  if (pending > 0) levels.push({ impact: 0, label: "Por valorar", color: "#8291a8", count: pending });
  let cursor = 0;
  const stops = levels.filter((level) => level.count > 0).map((level) => {
    const start = cursor;
    cursor += level.count / total * 100;
    return `${level.color} ${start}% ${cursor}%`;
  });

  return (
    <div className="hoy-boe-distribution">
      <div className="hoy-boe-donut" role="img" aria-label={`${total} ${total === 1 ? "disposición" : "disposiciones"} en el último boletín`} style={{ background: total ? `conic-gradient(${stops.join(", ")})` : "#28364a" }}>
        <span aria-hidden="true"><strong>{total}</strong><small>total</small></span>
      </div>
      <ul className="hoy-boe-impact-legend" aria-label="Disposiciones por impacto">
        {levels.map((level) => <li key={level.impact} className={level.count ? "has-entries" : undefined}>
          <i style={{ background: level.color }} aria-hidden="true" /><span>{level.label}</span><strong>{level.count}</strong>
        </li>)}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { RECAUDACION_2025 } from "@/lib/fiesta-data";
import { GASTO_ANUAL } from "@/lib/pensiones-data";
import { TopicLogo } from "./TopicLogo";

/** Las miniaturas usan los mismos datos curados que los informes; no hay
 * cifras de portada que mantener por separado. Las fuentes viven en ellos. */
export function PromoSubvenciones() {
  const maximum = Math.max(...GASTO_ANUAL.map((point) => point.millones));
  const taxes = [RECAUDACION_2025.irpfMillones, RECAUDACION_2025.ivaMillones,
    RECAUDACION_2025.sociedadesMillones, RECAUDACION_2025.especialesMillones, RECAUDACION_2025.otrosMillones];
  return (
    <nav className="special-covers" aria-label="Radiografías del dinero público">
      <Link href="/subvenciones" className="special-cover" data-engagement="special_open">
        <div className="special-art grant-art" aria-hidden="true"><span>€</span><i /><span>↗</span></div>
        <p className="eyebrow special-label"><TopicLogo topic="subvenciones" />01 / Subvenciones</p>
        <h3>¿Dónde va el dinero sin concurso?</h3>
        <p>Explora las concesiones directas, sus importes y las administraciones que las convocan.</p>
        <small>Datos de la BDNS · Actualización semanal</small>
        <span className="text-link">Seguir el dinero →</span>
      </Link>
      <Link href="/pensiones" className="special-cover" data-engagement="special_open">
        <div className="special-art pension-art" aria-hidden="true">
          {GASTO_ANUAL.map((point) => <i key={point.anio} style={{ height: `${point.millones / maximum * 100}%` }} />)}
        </div>
        <p className="eyebrow special-label"><TopicLogo topic="pensiones" />02 / Pensiones</p>
        <h3>Un sistema que nos afecta a todos.</h3>
        <p>Cómo se financia, cuánto crece y qué retos tiene por delante.</p>
        <small>Gasto contributivo {GASTO_ANUAL[0].anio}–{GASTO_ANUAL.at(-1)!.anio} · Seguridad Social</small>
        <span className="text-link">Entender las pensiones →</span>
      </Link>
      <Link href="/quien-paga" className="special-cover" data-engagement="special_open">
        <div className="special-art tax-art" aria-hidden="true">
          {taxes.map((value, index) => <i key={index} style={{ flex: value }} />)}
        </div>
        <p className="eyebrow special-label"><TopicLogo topic="quien-paga" />03 / Fiscalidad</p>
        <h3>¿Quién paga la fiesta?</h3>
        <p>Impuestos, rentas y reparto. Pon tu situación en perspectiva con la calculadora.</p>
        <small>Recaudación por impuesto, {RECAUDACION_2025.periodo} · AEAT</small>
        <span className="text-link">Explorar el reparto →</span>
      </Link>
    </nav>
  );
}

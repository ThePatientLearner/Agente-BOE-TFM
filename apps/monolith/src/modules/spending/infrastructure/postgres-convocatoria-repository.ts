import { and, between, count, desc, eq, inArray, max, min, sql, sum } from "drizzle-orm";
import type { Database } from "../../../shared/db/connection.js";
import { isoDate, type IsoDate } from "../../../shared/domain/iso-date.js";
import type {
  Cobertura,
  PeriodoDisponible,
  RepartoPeriodo,
  RepartoTramo,
  SpendingReadModel,
} from "../application/queries.js";
import type { Concesion } from "../domain/concesion.js";
import type {
  ConcesionRepository,
  MayorConcesionDirecta,
  RepartoDirectasPorSector,
  TramoSector,
} from "../domain/concesion-repository.js";
import type { Convocatoria } from "../domain/convocatoria.js";
import { urlOficialDe } from "../domain/convocatoria.js";
import type {
  ConvocatoriaRepository,
  ResumenDirectas,
} from "../domain/convocatoria-repository.js";
import type { SectorBeneficiario } from "../domain/sector-beneficiario.js";
import { concesiones, convocatorias } from "./schema.js";

type ConvocatoriaRow = typeof convocatorias.$inferSelect;

/**
 * Persistencia de convocatorias en el schema `spending`.
 *
 * `save` es un UPSERT sobre el código BDNS. Importa más de lo que parece:
 * la BDNS corrige fichas después de publicarlas, así que re-ingerir un
 * periodo no solo evita duplicados, también arrastra las correcciones.
 */
export class PostgresConvocatoriaRepository
  implements ConvocatoriaRepository, ConcesionRepository, SpendingReadModel
{
  constructor(private readonly db: Database) {}

  async cobertura(): Promise<Cobertura | null> {
    const [fila] = await this.db
      .select({
        desde: min(convocatorias.fechaRecepcion),
        hasta: max(convocatorias.fechaRecepcion),
        total: count(),
      })
      .from(convocatorias);

    if (!fila || fila.desde === null || fila.hasta === null) return null;

    const desde = isoDate(fila.desde);
    const hasta = isoDate(fila.hasta);
    if (!desde.ok || !hasta.ok) return null;

    return { desde: desde.value, hasta: hasta.value, convocatorias: Number(fila.total) };
  }

  /**
   * Meses con datos. La web genera una página estática por cada uno, de modo
   * que esta consulta decide cuántas páginas existen: por eso devuelve el
   * rango real de cada mes y no el primero y el último del calendario. Un mes
   * a medio ingerir debe anunciarse por lo que tiene.
   */
  async periodos(): Promise<PeriodoDisponible[]> {
    const mes = sql<string>`to_char(${convocatorias.fechaRecepcion}, 'YYYY-MM')`;

    const filas = await this.db
      .select({
        mes,
        desde: min(convocatorias.fechaRecepcion),
        hasta: max(convocatorias.fechaRecepcion),
        total: count(),
      })
      .from(convocatorias)
      .groupBy(mes)
      .orderBy(desc(mes));

    return filas.flatMap((fila) => {
      const desde = isoDate(fila.desde ?? "");
      const hasta = isoDate(fila.hasta ?? "");
      if (!desde.ok || !hasta.ok) return [];
      return [
        {
          mes: fila.mes,
          desde: desde.value,
          hasta: hasta.value,
          convocatorias: Number(fila.total),
        },
      ];
    });
  }

  /**
   * Un único GROUP BY sobre `es_concesion_directa` devuelve los tres tramos:
   * `true`, `false` y `NULL`. Hacerlo en tres consultas separadas abriría la
   * puerta a que los porcentajes no sumaran, porque cada una vería la tabla
   * en un instante distinto.
   */
  async reparto(desde: IsoDate, hasta: IsoDate): Promise<RepartoPeriodo> {
    const filas = await this.db
      .select({
        directa: convocatorias.esConcesionDirecta,
        convocatorias: count(),
        importe: sum(convocatorias.presupuestoTotal),
      })
      .from(convocatorias)
      .where(between(convocatorias.fechaRecepcion, desde, hasta))
      .groupBy(convocatorias.esConcesionDirecta);

    const vacio: RepartoTramo = { convocatorias: 0, importe: "0" };
    const tramoDe = (directa: boolean | null): RepartoTramo => {
      const fila = filas.find((f) => f.directa === directa);
      if (!fila) return vacio;
      return {
        convocatorias: Number(fila.convocatorias),
        // `sum()` devuelve null si no hay ninguna fila con importe: para la
        // web es cero, no "se desconoce".
        importe: fila.importe ?? "0",
      };
    };

    return {
      desde,
      hasta,
      directas: tramoDe(true),
      competitivas: tramoDe(false),
      sinClasificar: tramoDe(null),
    };
  }

  async save(convocatoria: Convocatoria): Promise<void> {
    const values = {
      codigoBdns: convocatoria.codigoBdns,
      fechaRecepcion: convocatoria.fechaRecepcion,
      descripcion: convocatoria.descripcion,
      tipoConvocatoria: convocatoria.tipoConvocatoria,
      esConcesionDirecta: convocatoria.esConcesionDirecta,
      nivel1: convocatoria.nivel1,
      nivel2: convocatoria.nivel2,
      nivel3: convocatoria.nivel3,
      presupuestoTotal: convocatoria.presupuestoTotal,
      urlBasesReguladoras: convocatoria.urlBasesReguladoras,
      urlOficial: convocatoria.urlOficial,
    };

    await this.db
      .insert(convocatorias)
      .values(values)
      .onConflictDoUpdate({
        target: convocatorias.codigoBdns,
        set: { ...values, updatedAt: new Date() },
      });
  }

  async existentes(codigos: readonly string[]): Promise<Set<string>> {
    if (codigos.length === 0) return new Set();

    const filas = await this.db
      .select({ codigoBdns: convocatorias.codigoBdns })
      .from(convocatorias)
      .where(inArray(convocatorias.codigoBdns, [...codigos]));

    return new Set(filas.map((fila) => fila.codigoBdns));
  }

  async resumenDirectas(desde: IsoDate, hasta: IsoDate): Promise<ResumenDirectas[]> {
    const filas = await this.db
      .select({
        nivel1: convocatorias.nivel1,
        nivel2: convocatorias.nivel2,
        convocatorias: count(),
        importeTotal: sum(convocatorias.presupuestoTotal),
      })
      .from(convocatorias)
      .where(
        and(
          eq(convocatorias.esConcesionDirecta, true),
          between(convocatorias.fechaRecepcion, desde, hasta),
        ),
      )
      .groupBy(convocatorias.nivel1, convocatorias.nivel2)
      // Ordenado por dinero, no por número: interesa dónde está el importe.
      .orderBy(desc(sum(convocatorias.presupuestoTotal)));

    return filas.map((fila) => ({
      nivel1: fila.nivel1,
      nivel2: fila.nivel2,
      convocatorias: Number(fila.convocatorias),
      importeTotal: fila.importeTotal,
    }));
  }

  async listarDirectas(
    desde: IsoDate,
    hasta: IsoDate,
    limite: number,
  ): Promise<Convocatoria[]> {
    const filas = await this.db
      .select()
      .from(convocatorias)
      .where(
        and(
          eq(convocatorias.esConcesionDirecta, true),
          between(convocatorias.fechaRecepcion, desde, hasta),
        ),
      )
      // NULLS LAST: una convocatoria sin importe no debe encabezar el ranking.
      .orderBy(sql`${convocatorias.presupuestoTotal} DESC NULLS LAST`)
      .limit(limite);

    return filas.map(aDominio);
  }

  async saveMany(filas: readonly Concesion[]): Promise<void> {
    if (filas.length === 0) return;

    // Lotes: un INSERT por fila en 80k concesiones sería eterno.
    const LOTE = 500;
    for (let i = 0; i < filas.length; i += LOTE) {
      const trozo = filas.slice(i, i + LOTE);
      const values = trozo.map((c) => ({
        codConcesion: c.codConcesion,
        fechaConcesion: c.fechaConcesion,
        numeroConvocatoria: c.numeroConvocatoria,
        beneficiario: c.beneficiario,
        nifCif: c.nifCif,
        importe: c.importe,
        sector: c.sector,
        nivel1: c.nivel1,
        nivel2: c.nivel2,
      }));

      await this.db
        .insert(concesiones)
        .values(values)
        .onConflictDoUpdate({
          target: concesiones.codConcesion,
          set: {
            fechaConcesion: sql`excluded.fecha_concesion`,
            numeroConvocatoria: sql`excluded.numero_convocatoria`,
            beneficiario: sql`excluded.beneficiario`,
            nifCif: sql`excluded.nif_cif`,
            importe: sql`excluded.importe`,
            sector: sql`excluded.sector`,
            nivel1: sql`excluded.nivel1`,
            nivel2: sql`excluded.nivel2`,
            updatedAt: new Date(),
          },
        });
    }
  }

  async repartoDirectasPorSector(
    desde: IsoDate,
    hasta: IsoDate,
  ): Promise<RepartoDirectasPorSector> {
    const vacio = (sector: SectorBeneficiario): TramoSector => ({
      sector,
      concesiones: 0,
      importe: "0",
    });

    // Solo adjudicaciones cuya convocatoria es directa: el join es la
    // definición del dato. Filtrar solo por fecha de concesión contaría
    // también el dinero de concursos competitivos.
    const filas = await this.db
      .select({
        sector: concesiones.sector,
        total: count(),
        importe: sum(concesiones.importe),
      })
      .from(concesiones)
      .innerJoin(
        convocatorias,
        eq(concesiones.numeroConvocatoria, convocatorias.codigoBdns),
      )
      .where(
        and(
          eq(convocatorias.esConcesionDirecta, true),
          between(concesiones.fechaConcesion, desde, hasta),
        ),
      )
      .groupBy(concesiones.sector);

    const tramoDe = (sector: SectorBeneficiario): TramoSector => {
      const fila = filas.find((f) => f.sector === sector);
      if (!fila) return vacio(sector);
      return {
        sector,
        concesiones: Number(fila.total),
        importe: fila.importe ?? "0",
      };
    };

    const publico = tramoDe("publico");
    const privado = tramoDe("privado");
    const desconocido = tramoDe("desconocido");
    const sinDatos =
      publico.concesiones + privado.concesiones + desconocido.concesiones === 0;

    return { desde, hasta, publico, privado, desconocido, sinDatos };
  }

  async listarMayoresConcesionesDirectas(
    desde: IsoDate,
    hasta: IsoDate,
    limite: number,
    sector: "publico" | "privado" | null = null,
  ): Promise<MayorConcesionDirecta[]> {
    const filtros = [
      eq(convocatorias.esConcesionDirecta, true),
      between(concesiones.fechaConcesion, desde, hasta),
    ];
    if (sector) filtros.push(eq(concesiones.sector, sector));

    const filas = await this.db
      .select({
        codConcesion: concesiones.codConcesion,
        fechaConcesion: concesiones.fechaConcesion,
        numeroConvocatoria: concesiones.numeroConvocatoria,
        beneficiario: concesiones.beneficiario,
        importe: concesiones.importe,
        sector: concesiones.sector,
        nivel1: concesiones.nivel1,
        nivel2: concesiones.nivel2,
        descripcionConvocatoria: convocatorias.descripcion,
      })
      .from(concesiones)
      .innerJoin(
        convocatorias,
        eq(concesiones.numeroConvocatoria, convocatorias.codigoBdns),
      )
      .where(and(...filtros))
      .orderBy(sql`${concesiones.importe} DESC NULLS LAST`)
      .limit(limite);

    return filas.flatMap((fila) => {
      const fecha = isoDate(fila.fechaConcesion ?? "");
      if (!fecha.ok) return [];
      const sectorVal = fila.sector as SectorBeneficiario;
      if (sectorVal !== "publico" && sectorVal !== "privado" && sectorVal !== "desconocido") {
        return [];
      }
      return [
        {
          codConcesion: fila.codConcesion,
          fechaConcesion: fecha.value,
          numeroConvocatoria: fila.numeroConvocatoria,
          beneficiario: fila.beneficiario,
          importe: fila.importe,
          sector: sectorVal,
          nivel1: fila.nivel1,
          nivel2: fila.nivel2,
          descripcionConvocatoria: fila.descripcionConvocatoria,
          urlOficial: urlOficialDe(fila.numeroConvocatoria),
        },
      ];
    });
  }

  async listarMayoresPublicas(
    desde: IsoDate,
    hasta: IsoDate,
    limite: number,
  ): Promise<MayorConcesionDirecta[]> {
    return this.listarMayoresConcesionesDirectas(desde, hasta, limite, "publico");
  }

  async listarMayoresPrivadas(
    desde: IsoDate,
    hasta: IsoDate,
    limite: number,
  ): Promise<MayorConcesionDirecta[]> {
    return this.listarMayoresConcesionesDirectas(desde, hasta, limite, "privado");
  }
}

function aDominio(fila: ConvocatoriaRow): Convocatoria {
  const fecha = isoDate(fila.fechaRecepcion);
  if (!fecha.ok) {
    throw new Error(
      `Fila corrupta en spending.convocatorias (${fila.codigoBdns}): ${fecha.error.message}`,
    );
  }

  return {
    codigoBdns: fila.codigoBdns,
    fechaRecepcion: fecha.value,
    descripcion: fila.descripcion,
    tipoConvocatoria: fila.tipoConvocatoria,
    esConcesionDirecta: fila.esConcesionDirecta,
    nivel1: fila.nivel1,
    nivel2: fila.nivel2,
    nivel3: fila.nivel3,
    presupuestoTotal: fila.presupuestoTotal,
    urlBasesReguladoras: fila.urlBasesReguladoras,
    urlOficial: fila.urlOficial,
  };
}

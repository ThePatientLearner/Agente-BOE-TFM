import { boolean, date, index, numeric, pgSchema, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Schema del módulo `spending`: convocatorias de subvenciones publicadas en
 * la BDNS (Base de Datos Nacional de Subvenciones).
 *
 * Igual que el resto de módulos, tiene su propio schema de Postgres y no lee
 * las tablas de nadie. La clave natural es el código BDNS, que hace la
 * ingesta idempotente exactamente igual que el `BOE-A-…` en `ingestion`.
 */
export const spendingSchema = pgSchema("spending");

export const convocatorias = spendingSchema.table(
  "convocatorias",
  {
    // Código BDNS (p. ej. "924187") — clave natural y estable.
    codigoBdns: text("codigo_bdns").primaryKey(),
    fechaRecepcion: date("fecha_recepcion").notNull(),
    descripcion: text("descripcion").notNull(),

    // Texto tal cual lo devuelve la BDNS ("Concesión directa - canónica",
    // "Concurrencia competitiva - canónica", …). Se guarda sin normalizar
    // para poder reclasificar sin volver a descargar.
    tipoConvocatoria: text("tipo_convocatoria"),

    // La señal: ¿se concedió sin concurso?
    // NULL a propósito cuando `tipoConvocatoria` no encaja en ninguna
    // categoría conocida. En una herramienta de fiscalización, marcar por
    // defecto como "hubo concurso" lo que no se ha entendido sería el peor
    // fallo posible: esconde justo lo que se busca.
    esConcesionDirecta: boolean("es_concesion_directa"),

    // Administración que convoca: ESTADO | AUTONOMICA | LOCAL | OTROS.
    nivel1: text("nivel1").notNull(),
    // Ministerio, comunidad autónoma o municipio.
    nivel2: text("nivel2"),
    // Órgano concreto (dirección general, concejalía…).
    nivel3: text("nivel3"),

    // numeric, no float: son euros y no se redondean a la ligera.
    presupuestoTotal: numeric("presupuesto_total", { precision: 16, scale: 2 }),

    urlBasesReguladoras: text("url_bases_reguladoras"),
    // Enlace a la ficha oficial: en este proyecto la fuente siempre va delante.
    urlOficial: text("url_oficial").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Las dos consultas del informe: "directas por fecha" y "directas por órgano".
    index("spending_convocatorias_fecha_idx").on(table.fechaRecepcion),
    index("spending_convocatorias_directa_idx").on(table.esConcesionDirecta),
    index("spending_convocatorias_nivel_idx").on(table.nivel1, table.nivel2),
  ],
);

/**
 * Adjudicaciones individuales. El `sector` (público/privado/desconocido) se
 * calcula al ingerir a partir del NIF/CIF del beneficiario.
 */
export const concesiones = spendingSchema.table(
  "concesiones",
  {
    codConcesion: text("cod_concesion").primaryKey(),
    fechaConcesion: date("fecha_concesion").notNull(),
    numeroConvocatoria: text("numero_convocatoria").notNull(),
    beneficiario: text("beneficiario").notNull(),
    nifCif: text("nif_cif"),
    importe: numeric("importe", { precision: 16, scale: 2 }),
    /** publico | privado | desconocido */
    sector: text("sector").notNull(),
    nivel1: text("nivel1"),
    nivel2: text("nivel2"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("spending_concesiones_fecha_idx").on(table.fechaConcesion),
    index("spending_concesiones_convocatoria_idx").on(table.numeroConvocatoria),
    index("spending_concesiones_sector_idx").on(table.sector),
  ],
);

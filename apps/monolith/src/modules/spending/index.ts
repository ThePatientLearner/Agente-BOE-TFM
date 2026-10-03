/**
 * API pública del módulo `spending`: convocatorias de subvenciones de la
 * BDNS, con el foco en distinguir las concedidas por concurrencia
 * competitiva de las de concesión directa.
 *
 * Nada fuera del módulo importa de sus carpetas internas — la regla la
 * verifica dependency-cruiser en CI.
 */
export { IngestConvocatorias, type IngestReport } from "./application/ingest-convocatorias.js";
export {
  IngestConcesiones,
  type IngestConcesionesReport,
} from "./application/ingest-concesiones.js";
export type {
  Cobertura,
  MayorConcesionDirecta,
  PeriodoDisponible,
  RepartoDirectasPorSector,
  RepartoPeriodo,
  RepartoTramo,
  SpendingReadModel,
  TramoSector,
} from "./application/queries.js";
export { clasificar, urlOficialDe, type Convocatoria } from "./domain/convocatoria.js";
export type { Concesion } from "./domain/concesion.js";
export type { BdnsGateway, ConvocatoriaResumen } from "./domain/bdns-gateway.js";
export type {
  ConvocatoriaRepository,
  ResumenDirectas,
} from "./domain/convocatoria-repository.js";
export type { ConcesionRepository } from "./domain/concesion-repository.js";
export {
  clasificarSectorBeneficiario,
  extraerNifCif,
  type SectorBeneficiario,
} from "./domain/sector-beneficiario.js";
export { BdnsApiGateway } from "./infrastructure/bdns-api-gateway.js";
export { PostgresConvocatoriaRepository } from "./infrastructure/postgres-convocatoria-repository.js";

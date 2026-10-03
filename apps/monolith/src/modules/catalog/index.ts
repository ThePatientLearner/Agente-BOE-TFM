/** API pública del módulo `catalog`. */
export type {
  CatalogDayView,
  CatalogEntryView,
  CatalogReadModel,
  CatalogSearchParams,
  AssistantSearchParams,
} from "./application/queries.js";
export { searchTerms } from './application/search-terms.js';
export { InMemoryCatalogProjection } from "./infrastructure/in-memory-catalog-projection.js";
export { PostgresCatalogProjection } from "./infrastructure/postgres-catalog-projection.js";

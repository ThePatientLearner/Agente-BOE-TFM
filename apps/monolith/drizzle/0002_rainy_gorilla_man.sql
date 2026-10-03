CREATE SCHEMA "spending";
--> statement-breakpoint
CREATE TABLE "spending"."convocatorias" (
	"codigo_bdns" text PRIMARY KEY NOT NULL,
	"fecha_recepcion" date NOT NULL,
	"descripcion" text NOT NULL,
	"tipo_convocatoria" text,
	"es_concesion_directa" boolean,
	"nivel1" text NOT NULL,
	"nivel2" text,
	"nivel3" text,
	"presupuesto_total" numeric(16, 2),
	"url_bases_reguladoras" text,
	"url_oficial" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "spending_convocatorias_fecha_idx" ON "spending"."convocatorias" USING btree ("fecha_recepcion");--> statement-breakpoint
CREATE INDEX "spending_convocatorias_directa_idx" ON "spending"."convocatorias" USING btree ("es_concesion_directa");--> statement-breakpoint
CREATE INDEX "spending_convocatorias_nivel_idx" ON "spending"."convocatorias" USING btree ("nivel1","nivel2");
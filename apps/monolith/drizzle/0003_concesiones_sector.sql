-- Concesiones (adjudicaciones) de la BDNS: permiten saber a quién llega el
-- dinero de las subvenciones, no solo quién convoca. El sector (público /
-- privado) se clasifica por la letra del NIF/CIF del beneficiario.
CREATE TABLE IF NOT EXISTS "spending"."concesiones" (
	"cod_concesion" text PRIMARY KEY NOT NULL,
	"fecha_concesion" date NOT NULL,
	"numero_convocatoria" text NOT NULL,
	"beneficiario" text NOT NULL,
	"nif_cif" text,
	"importe" numeric(16, 2),
	"sector" text NOT NULL,
	"nivel1" text,
	"nivel2" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spending_concesiones_fecha_idx" ON "spending"."concesiones" USING btree ("fecha_concesion");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spending_concesiones_convocatoria_idx" ON "spending"."concesiones" USING btree ("numero_convocatoria");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "spending_concesiones_sector_idx" ON "spending"."concesiones" USING btree ("sector");

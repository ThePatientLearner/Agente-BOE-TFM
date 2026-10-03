-- Partidas del juego de la web ("¡Haz que todos se suscriban!"). No hay
-- usuarios ni sesiones: la clave natural es el código de un solo uso que se
-- le entrega al jugador al terminar, y que es su única prueba de haber
-- jugado esa partida si acaba ganando el premio.
CREATE SCHEMA IF NOT EXISTS "juego";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "juego"."partidas" (
	"codigo" text PRIMARY KEY NOT NULL,
	"seudonimo" text,
	"puntos" integer NOT NULL,
	"nivel" integer NOT NULL,
	"segundos" integer NOT NULL,
	"mejor_combo" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "juego_partidas_puntos_idx" ON "juego"."partidas" USING btree ("puntos" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "juego_partidas_fecha_idx" ON "juego"."partidas" USING btree ("created_at");

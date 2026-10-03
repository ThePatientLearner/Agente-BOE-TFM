ALTER TABLE electricidad.users ADD COLUMN study_access boolean NOT NULL DEFAULT false;
--> statement-breakpoint
UPDATE electricidad.users SET study_access = true WHERE status = 'active';
--> statement-breakpoint
CREATE SCHEMA assistant;
--> statement-breakpoint
CREATE TABLE assistant.usage (
  bucket text NOT NULL,
  day date NOT NULL,
  requests integer NOT NULL DEFAULT 0,
  tokens integer NOT NULL DEFAULT 0,
  last_request_at timestamptz,
  PRIMARY KEY (bucket, day)
);
--> statement-breakpoint
CREATE INDEX catalog_assistant_search ON catalog.entries USING gin (
  to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(plain_title,'') || ' ' || coalesce(department,'') || ' ' || coalesce(short_phrase,'') || ' ' || coalesce(bullet_points::text,''))
);

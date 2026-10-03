CREATE SCHEMA IF NOT EXISTS electricidad;
--> statement-breakpoint
CREATE TABLE electricidad.users (
 id uuid PRIMARY KEY,
 username text NOT NULL,
 username_key text NOT NULL UNIQUE,
 password_hash text NOT NULL,
 role text NOT NULL DEFAULT 'student' CHECK (role IN ('admin','student')),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','blocked')),
 created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE electricidad.sessions (
 token_hash text PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES electricidad.users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
--> statement-breakpoint
CREATE INDEX electricidad_sessions_user ON electricidad.sessions(user_id);
--> statement-breakpoint
CREATE TABLE electricidad.limits (key text PRIMARY KEY, hits integer NOT NULL, expires_at timestamptz NOT NULL);

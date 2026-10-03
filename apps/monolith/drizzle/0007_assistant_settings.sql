CREATE TABLE assistant.settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

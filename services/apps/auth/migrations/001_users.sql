CREATE TABLE users (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL,
  role          text NOT NULL CHECK (role IN ('super_admin', 'admin', 'editor')),
  active        boolean NOT NULL DEFAULT true,
  -- NULL : compte créé sans mot de passe, qui ne peut pas encore se connecter.
  password_hash text,
  last_login    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_email_key ON users (lower(email));

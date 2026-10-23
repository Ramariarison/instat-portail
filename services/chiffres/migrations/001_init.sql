CREATE TABLE data_types (
  id    text PRIMARY KEY,
  name  text NOT NULL UNIQUE,
  picto text NOT NULL DEFAULT ''
);

CREATE TABLE indicator_defs (
  id      text PRIMARY KEY,
  type_id text NOT NULL REFERENCES data_types (id) ON DELETE RESTRICT,
  name    text NOT NULL,
  picto   text NOT NULL DEFAULT ''
);
CREATE INDEX indicator_defs_type ON indicator_defs (type_id);

-- « Région en chiffres » : le niveau national (region_id NULL) ou une région.
-- region_id désigne une région du service Publications : pas de clé étrangère entre bases.
CREATE TABLE figure_regions (
  id        text PRIMARY KEY,
  name      text NOT NULL UNIQUE,
  region_id text UNIQUE
);

CREATE TABLE figure_values (
  id               text PRIMARY KEY,
  figure_region_id text NOT NULL REFERENCES figure_regions (id) ON DELETE CASCADE,
  indicator_id     text NOT NULL REFERENCES indicator_defs (id) ON DELETE RESTRICT,
  year             integer NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  value            double precision NOT NULL,
  unit             text NOT NULL,
  source           text NOT NULL,
  link             text,
  -- Une seule valeur par indicateur et par année pour une région (règle du formulaire du back-office).
  UNIQUE (figure_region_id, indicator_id, year)
);
CREATE INDEX figure_values_indicator ON figure_values (indicator_id);

-- Chiffres clés de la page d'accueil (contrat Indicator du front).
CREATE TABLE key_figures (
  id       text PRIMARY KEY,
  label    text NOT NULL,
  value    double precision NOT NULL,
  decimals integer NOT NULL DEFAULT 0 CHECK (decimals BETWEEN 0 AND 6),
  unit     text NOT NULL DEFAULT '',
  period   text NOT NULL,
  position integer NOT NULL DEFAULT 0
);

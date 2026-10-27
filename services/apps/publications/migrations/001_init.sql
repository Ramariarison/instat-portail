CREATE TABLE thematiques (
  id                   text PRIMARY KEY,
  name                 text NOT NULL,
  alias                text NOT NULL UNIQUE CHECK (alias ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  picto_url            text,
  covid                boolean NOT NULL DEFAULT false,
  in_menu_publications boolean NOT NULL DEFAULT false,
  in_menu_themes       boolean NOT NULL DEFAULT false,
  in_menu_services     boolean NOT NULL DEFAULT false
);

CREATE TABLE regions (
  id    text PRIMARY KEY,
  name  text NOT NULL UNIQUE,
  picto text NOT NULL DEFAULT ''
);

CREATE TABLE publications (
  id            text PRIMARY KEY,
  title         text NOT NULL,
  image_url     text,
  level         text NOT NULL CHECK (level IN ('national', 'regional')),
  region_id     text REFERENCES regions (id) ON DELETE RESTRICT,
  thematique_id text NOT NULL REFERENCES thematiques (id) ON DELETE RESTRICT,
  excerpt       text NOT NULL,
  content       text NOT NULL,
  -- [{ "id", "name", "size" }] : fichiers stockés par le service Fichiers.
  documents     jsonb NOT NULL DEFAULT '[]',
  date          date NOT NULL,
  latest_nipc   boolean NOT NULL DEFAULT false,
  sectors       text[] NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK ((level = 'regional') = (region_id IS NOT NULL))
);

-- Une seule publication peut porter le marqueur « la plus récente NIPC ».
CREATE UNIQUE INDEX publications_one_latest_nipc ON publications ((true)) WHERE latest_nipc;
CREATE INDEX publications_level_date ON publications (level, date DESC);
CREATE INDEX publications_thematique ON publications (thematique_id);
CREATE INDEX publications_region ON publications (region_id);

-- Actualités du bandeau d'accueil (NewsItem).
CREATE TABLE news (
  id         text PRIMARY KEY,
  title      text NOT NULL,
  -- Date de tri ; date_label est le libellé libre affiché (« 22 et 23 janvier 2026 »).
  date       date,
  date_label text,
  context    text,
  href       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

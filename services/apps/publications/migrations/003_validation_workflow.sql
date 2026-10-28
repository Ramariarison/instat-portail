-- Workflow de validation : brouillon → soumise → publiée, ou renvoyée avec un commentaire.
ALTER TABLE publications
  ADD COLUMN status          text NOT NULL DEFAULT 'draft'
                             CHECK (status IN ('draft', 'submitted', 'returned', 'published')),
  ADD COLUMN created_by      text,
  ADD COLUMN created_by_name text,
  ADD COLUMN submitted_at    timestamptz,
  ADD COLUMN published_at    timestamptz;

-- Les publications existantes étaient déjà en ligne : elles le restent.
UPDATE publications SET status = 'published', published_at = updated_at;

CREATE INDEX publications_status ON publications (status, date DESC);
CREATE INDEX publications_created_by ON publications (created_by);

-- Historique des décisions : soumission, renvoi (avec commentaire), publication.
CREATE TABLE publication_reviews (
  id             text PRIMARY KEY,
  publication_id text NOT NULL REFERENCES publications (id) ON DELETE CASCADE,
  action         text NOT NULL CHECK (action IN ('submitted', 'returned', 'published')),
  comment        text,
  author_id      text NOT NULL,
  author_name    text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (action <> 'returned' OR comment IS NOT NULL)
);

CREATE INDEX publication_reviews_publication ON publication_reviews (publication_id, created_at);

-- « La plus récente NIPC » : une seule parmi les publications EN LIGNE (un brouillon peut déjà porter le marqueur,
-- il ne le prend aux autres qu'au moment de sa publication).
DROP INDEX publications_one_latest_nipc;
CREATE UNIQUE INDEX publications_one_latest_nipc ON publications ((true)) WHERE latest_nipc AND status = 'published';

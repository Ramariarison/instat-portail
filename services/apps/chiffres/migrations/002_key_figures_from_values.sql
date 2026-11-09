-- Valeurs mensuelles (NIPC…) : mois facultatif ; une seule valeur par (région, indicateur, année, mois).
ALTER TABLE figure_values ADD COLUMN month smallint CHECK (month BETWEEN 1 AND 12);
ALTER TABLE figure_values DROP CONSTRAINT figure_values_figure_region_id_indicator_id_year_key;
CREATE UNIQUE INDEX figure_values_one_per_period ON figure_values (figure_region_id, indicator_id, year, coalesce(month, 0));

-- Chiffres clés de l'accueil : un choix d'indicateurs et leur ordre. La valeur affichée est la plus récente
-- de la fiche nationale (figure_regions.region_id NULL) : plus de valeur recopiée à la main.
DROP TABLE key_figures;
CREATE TABLE key_figures (
  id           text PRIMARY KEY,
  indicator_id text NOT NULL UNIQUE REFERENCES indicator_defs (id) ON DELETE RESTRICT,
  -- Libellé affiché à l'accueil ; NULL : nom de l'indicateur.
  label        text,
  decimals     integer NOT NULL DEFAULT 0 CHECK (decimals BETWEEN 0 AND 6),
  position     integer NOT NULL DEFAULT 0
);

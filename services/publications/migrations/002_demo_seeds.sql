-- Lots de données d'exemple déjà chargés (SEED_DEMO=true) : chacun ne l'est qu'une fois,
-- un exemple supprimé dans le back-office ne réapparaît donc pas au redémarrage.
CREATE TABLE demo_seeds (
  name       text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

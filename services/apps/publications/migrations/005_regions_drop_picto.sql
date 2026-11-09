-- Le picto des régions n'était qu'un nom de fichier saisi à la main, sans fichier derrière.
-- Le site dessine désormais la silhouette de chaque région à partir du fond de carte (front).
ALTER TABLE regions DROP COLUMN picto;

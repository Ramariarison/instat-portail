-- Actualités gérées dans le back-office : une image et un texte, affichés sur la page de l'actualité.
ALTER TABLE news
  ADD COLUMN image_url text,
  ADD COLUMN content   text;

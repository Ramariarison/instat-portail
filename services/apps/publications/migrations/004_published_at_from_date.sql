-- Publications en ligne avant le workflow (ou chargées comme exemples) : leur date de mise en ligne est leur date
-- de publication, pas le jour de la migration. Celles publiées par le workflow gardent leur date réelle.
UPDATE publications p
SET published_at = p.date::timestamptz
WHERE p.status = 'published'
  AND NOT EXISTS (
    SELECT 1 FROM publication_reviews r WHERE r.publication_id = p.id AND r.action = 'published'
  );

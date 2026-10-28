/**
 * Description d'une table exposée en JSON. Les noms de colonnes viennent du code, jamais de la requête :
 * ils peuvent être interpolés dans le SQL ; les valeurs, elles, sont toujours passées en paramètres.
 */
export interface TableDefinition {
  name: string;
  /** Libellé pour les messages (« Thématique introuvable. »). */
  label: string;
  idPrefix: string;
  /** Champ JSON (camelCase) → colonne SQL. `id` est implicite. */
  columns: Record<string, string>;
  /** Colonnes jsonb (encodées avec JSON.stringify). */
  json?: string[];
  /** Champs écrits mais jamais relus (mot de passe…). */
  writeOnly?: string[];
  /** Champs calculés, lus mais jamais écrits : champ JSON → expression SQL (peut citer `<table>.colonne`). */
  computed?: Record<string, string>;
  orderBy: string;
}

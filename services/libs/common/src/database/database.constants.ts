/** Jeton d'injection du pool PostgreSQL (`@Inject(PG_POOL) pool: Pool`). */
export const PG_POOL = Symbol("PG_POOL");

/** Jeton d'injection des options du module (dossier des migrations). */
export const DATABASE_OPTIONS = Symbol("DATABASE_OPTIONS");

export interface DatabaseOptions {
  /** Dossier des fichiers `NNN_nom.sql`, appliqués dans l'ordre au démarrage. */
  migrationsDir: string;
}

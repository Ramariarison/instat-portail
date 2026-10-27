import pg from "pg";

// Les colonnes DATE restent des chaînes « AAAA-MM-JJ » (pas de conversion en Date, donc pas de décalage horaire).
pg.types.setTypeParser(pg.types.builtins.DATE, (value: string) => value);

export function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL n'est pas défini.");
  return new pg.Pool({ connectionString, max: Number(process.env.DB_POOL_SIZE ?? 10) });
}

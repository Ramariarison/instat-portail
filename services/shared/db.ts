import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

// Les colonnes DATE restent des chaînes « AAAA-MM-JJ » (pas de conversion en Date, donc pas de décalage horaire).
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

export type Db = pg.Pool | pg.PoolClient;

export function createPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL n'est pas défini.");
  return new pg.Pool({ connectionString, max: Number(process.env.DB_POOL_SIZE ?? 10) });
}

/**
 * Applique, dans l'ordre alphabétique, les fichiers `*.sql` du dossier qui ne l'ont pas encore été.
 * Un verrou consultatif évite que deux répliques migrent en même temps.
 */
export async function migrate(pool: pg.Pool, dir: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(727274)");
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
    );
    const applied = new Set((await client.query<{ name: string }>("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
    const files = (await readdir(dir)).filter((file) => file.endsWith(".sql")).sort();

    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await readFile(path.join(dir, file), "utf8");
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${file} en échec : ${(error as Error).message}`, { cause: error });
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(727274)").catch(() => undefined);
    client.release();
  }
}

export async function transaction<T>(pool: pg.Pool, work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/** Retire les valeurs null : le contrat du front utilise des champs optionnels, pas des null. */
export function compact<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null)) as T;
}

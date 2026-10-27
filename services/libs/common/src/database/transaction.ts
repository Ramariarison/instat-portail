import type { Pool, PoolClient } from "pg";

/** Pool ou connexion en cours de transaction : les dépôts acceptent l'un ou l'autre. */
export type Db = Pool | PoolClient;

/** Exécute `work` dans une transaction : COMMIT si tout réussit, ROLLBACK sinon. */
export async function runInTransaction<T>(pool: Pool, work: (client: PoolClient) => Promise<T>): Promise<T> {
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

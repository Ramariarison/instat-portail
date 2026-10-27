import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Inject, Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import type { Pool } from "pg";
import { DATABASE_OPTIONS, type DatabaseOptions, PG_POOL } from "./database.constants";

const LOCK_ID = 727274;

/**
 * Applique au démarrage, dans l'ordre alphabétique, les fichiers `*.sql` pas encore appliqués
 * (table schema_migrations). Chaque fichier passe dans une transaction ; un verrou consultatif
 * évite que deux répliques migrent en même temps.
 */
@Injectable()
export class MigrationRunner implements OnModuleInit {
  private readonly logger = new Logger(MigrationRunner.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(DATABASE_OPTIONS) private readonly options: DatabaseOptions,
  ) {}

  async onModuleInit(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
      await client.query(
        "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
      );
      const applied = new Set(
        (await client.query<{ name: string }>("SELECT name FROM schema_migrations")).rows.map((row) => row.name),
      );
      const files = (await readdir(this.options.migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

      for (const file of files.filter((name) => !applied.has(name))) {
        const sql = await readFile(path.join(this.options.migrationsDir, file), "utf8");
        try {
          await client.query("BEGIN");
          await client.query(sql);
          await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
          await client.query("COMMIT");
          this.logger.log(`Migration appliquée : ${file}`);
        } catch (error) {
          await client.query("ROLLBACK");
          throw new Error(`Migration ${file} en échec : ${(error as Error).message}`, { cause: error });
        }
      }
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => undefined);
      client.release();
    }
  }
}

import { type DynamicModule, Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import type { Pool } from "pg";
import { DATABASE_OPTIONS, type DatabaseOptions, PG_POOL } from "./database.constants";
import { MigrationRunner } from "./migration-runner";
import { createPool } from "./pool.factory";

/**
 * Accès à PostgreSQL : un pool par service (DATABASE_URL), les migrations appliquées au démarrage,
 * et la fermeture propre du pool à l'arrêt.
 */
@Global()
@Module({})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  static forRoot(options: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        { provide: DATABASE_OPTIONS, useValue: options },
        { provide: PG_POOL, useFactory: createPool },
        MigrationRunner,
      ],
      exports: [PG_POOL],
    };
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

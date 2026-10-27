import { Inject, Injectable, Logger, type OnApplicationBootstrap } from "@nestjs/common";
import type { Pool, PoolClient } from "pg";
import { PG_POOL, runInTransaction, slug } from "@app/common";
import { indicatorSeeds, keyFigureSeeds, regionNames, typeSeeds, valueSeeds } from "./demo-data";

// Même identifiant que la région du service Publications.
const regionId = (name: string) => `reg-${slug(name)}`;

/** Données d'exemple (SEED_DEMO=true), chargées au démarrage seulement si la base est vide. */
@Injectable()
export class DemoSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoSeedService.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_DEMO !== "true") return;
    const { rows } = await this.pool.query<{ count: number }>("SELECT count(*)::int AS count FROM data_types");
    if (rows[0]!.count > 0) return;
    await runInTransaction(this.pool, (client) => this.seed(client));
    this.logger.log("Données d'exemple chargées.");
  }

  private async seed(client: PoolClient): Promise<void> {
    for (const [key, name] of typeSeeds) {
      await client.query("INSERT INTO data_types (id, name, picto) VALUES ($1, $2, $3)", [`type-${key}`, name, `${slug(name)}.png`]);
    }
    for (const [type, name, picto] of indicatorSeeds) {
      await client.query("INSERT INTO indicator_defs (id, type_id, name, picto) VALUES ($1, $2, $3, $4)", [
        `ind-${picto.replace(".png", "")}`, `type-${type}`, name, picto,
      ]);
    }
    await client.query("INSERT INTO figure_regions (id, name) VALUES ('fr-madagascar', 'Madagascar')");
    for (const name of regionNames) {
      await client.query("INSERT INTO figure_regions (id, name, region_id) VALUES ($1, $2, $3)", [
        `fr-${regionId(name)}`, name, regionId(name),
      ]);
    }
    for (const [figure, indicator, year, value, unit] of valueSeeds) {
      await client.query(
        `INSERT INTO figure_values (id, figure_region_id, indicator_id, year, value, unit, source)
         VALUES ($1, $2, $3, $4, $5, $6, 'Exemple (à remplacer)')`,
        [
          `val-${figure}-${indicator}`,
          figure === "madagascar" ? "fr-madagascar" : `fr-${regionId(figure)}`,
          `ind-${indicator}`,
          year,
          value,
          unit,
        ],
      );
    }
    for (const [index, [id, label, value, decimals, unit, period]] of keyFigureSeeds.entries()) {
      await client.query(
        "INSERT INTO key_figures (id, label, value, decimals, unit, period, position) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [id, label, value, decimals, unit, period, index],
      );
    }
  }
}

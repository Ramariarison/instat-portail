import { Inject, Injectable, Logger, type OnApplicationBootstrap } from "@nestjs/common";
import type { Pool, PoolClient } from "pg";
import { PG_POOL, runInTransaction, slug } from "@app/common";
import { indicatorSeeds, keyFigureSeeds, regionNames, typeSeeds } from "./demo-data";
import { figureSources, figureValues } from "./instat-figures.data";

// Même identifiant que la région du service Publications.
const regionId = (name: string) => `reg-${slug(name)}`;

/** Données d'exemple (SEED_DEMO=true), chargées au démarrage seulement si la base est vide : valeurs relevées sur le portail de l'INSTAT. */
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
    for (const [figure, rows] of Object.entries(figureValues)) {
      const figureId = figure === "Madagascar" ? "fr-madagascar" : `fr-${regionId(figure)}`;
      for (const [indicator, year, value, unit, source] of rows) {
        const { text, link } = figureSources[source]!;
        await client.query(
          `INSERT INTO figure_values (id, figure_region_id, indicator_id, year, value, unit, source, link)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [`val-${slug(figure)}-${indicator}`, figureId, `ind-${indicator}`, year, value, unit, text, link ?? null],
        );
      }
    }
    for (const [index, [id, label, value, decimals, unit, period]] of keyFigureSeeds.entries()) {
      await client.query(
        "INSERT INTO key_figures (id, label, value, decimals, unit, period, position) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [id, label, value, decimals, unit, period, index],
      );
    }
  }
}

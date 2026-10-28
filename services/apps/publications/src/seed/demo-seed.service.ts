import { Inject, Injectable, Logger, type OnApplicationBootstrap } from "@nestjs/common";
import type { Pool, PoolClient } from "pg";
import { PG_POOL, runInTransaction, slug } from "@app/common";
import { newsSeeds } from "./data/news.data";
import { basePublicationSeeds, extraPublicationSeeds } from "./data/publications.data";
import { regionNames } from "./data/regions.data";
import { thematiqueSeeds } from "./data/thematiques.data";

const regionId = (name: string) => `reg-${slug(name)}`;
const thematiqueId = (name: string) => `th-${slug(name)}`;

/**
 * Données d'exemple (SEED_DEMO=true), chargées au démarrage après les migrations.
 * Les publications d'exemple sont déjà en ligne (statut « published »).
 * Chaque lot ne l'est qu'une fois (table demo_seeds) : un exemple supprimé dans le back-office ne revient pas.
 */
@Injectable()
export class DemoSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoSeedService.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_DEMO !== "true") return;
    await this.runOnce("socle", (client) => this.seedBase(client));
    await this.runOnce("publications-par-thematique", (client) => this.seedExtraPublications(client));
  }

  /** Exécute un lot dans une transaction, s'il n'est pas déjà marqué dans demo_seeds. */
  private async runOnce(name: string, seed: (client: PoolClient) => Promise<void>): Promise<void> {
    await runInTransaction(this.pool, async (client) => {
      const marked = await client.query("INSERT INTO demo_seeds (name) VALUES ($1) ON CONFLICT DO NOTHING", [name]);
      if (!marked.rowCount) return;
      await seed(client);
      this.logger.log(`Données d'exemple chargées : ${name}`);
    });
  }

  /** Thématiques, régions, publications du prototype et actualités ; seulement sur une base vide. */
  private async seedBase(client: PoolClient): Promise<void> {
    const { rows } = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM thematiques");
    if (rows[0]!.count > 0) return;

    for (const t of thematiqueSeeds) {
      await client.query(
        `INSERT INTO thematiques (id, name, alias, covid, in_menu_publications, in_menu_themes, in_menu_services)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [thematiqueId(t.name), t.name, slug(t.name), Boolean(t.covid), Boolean(t.pub), Boolean(t.themes), Boolean(t.services)],
      );
    }
    for (const name of regionNames) {
      await client.query("INSERT INTO regions (id, name, picto) VALUES ($1, $2, $3)", [regionId(name), name, `${slug(name)}.png`]);
    }
    for (const p of basePublicationSeeds) {
      await client.query(
        `INSERT INTO publications (id, title, level, region_id, thematique_id, excerpt, content, documents, date, latest_nipc, sectors,
                                   status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'published', $9::date)`,
        [
          `pub-${p.id}`,
          p.title,
          p.region ? "regional" : "national",
          p.region ? regionId(p.region) : null,
          thematiqueId(p.thematique),
          `Publication de l'INSTAT : ${p.title}.`,
          `${p.title}.\n\nContenu d'exemple, à remplacer par le texte de la publication.`,
          JSON.stringify([{ id: `doc-${p.id}`, name: p.file, size: 1_250_000 }]),
          p.date,
          Boolean(p.nipc),
          [p.sector],
        ],
      );
    }
    for (const n of newsSeeds) {
      await client.query("INSERT INTO news (id, title, date, date_label, context, href) VALUES ($1, $2, $3, $4, $5, $6)", [
        n.id, n.title, n.date ?? null, n.dateLabel ?? null, n.context ?? null, n.href,
      ]);
    }
  }

  /** Au moins une publication par thématique ; seulement par-dessus le socle (jamais sur une base réelle). */
  private async seedExtraPublications(client: PoolClient): Promise<void> {
    const { rows } = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM thematiques WHERE id = 'th-economie'");
    if (rows[0]!.count === 0) return;

    for (const p of extraPublicationSeeds) {
      await client.query(
        `INSERT INTO publications (id, title, level, region_id, thematique_id, excerpt, content, date, sectors, status, published_at)
         SELECT $1, $2, $3, $4, t.id, $6, $7, $8, $9, 'published', $8::date FROM thematiques t WHERE t.id = $5
         ON CONFLICT (id) DO NOTHING`,
        [
          `pub-${p.id}`,
          p.title,
          p.region ? "regional" : "national",
          p.region ? regionId(p.region) : null,
          thematiqueId(p.thematique),
          `Publication d'exemple : ${p.title}.`,
          `${p.title}.\n\nContenu d'exemple, à remplacer par le texte de la publication.`,
          p.date,
          p.sectors,
        ],
      );
    }
  }
}

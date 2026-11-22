import { Inject, Injectable, Logger, type OnApplicationBootstrap } from "@nestjs/common";
import type { Pool, PoolClient } from "pg";
import { PG_POOL, runInTransaction, slug } from "@app/common";
import { newsSeeds } from "./data/news.data";
import { basePublicationSeeds, extraPublicationSeeds } from "./data/publications.data";
import { regionNames } from "./data/regions.data";
import { thematiqueSeeds } from "./data/thematiques.data";

const regionId = (name: string) => `reg-${slug(name)}`;
const thematiqueId = (name: string) => `th-${slug(name)}`;

/** Texte de la fiche : un paragraphe par élément, séparés par une ligne vide. */
const content = (body: string[]) => body.join("\n\n");

/** Premiers textes provisoires des publications de démonstration, remplacés par le lot « textes-publications ». */
const PROVISIONAL_EXCERPT = /^Publication (d'exemple|de l'INSTAT) : /;

/**
 * Données de démonstration (SEED_DEMO=true), chargées au démarrage après les migrations.
 * Les publications de démonstration sont déjà en ligne (statut « published »).
 * Chaque lot ne l'est qu'une fois (table demo_seeds) : une publication supprimée dans le back-office ne revient pas.
 */
@Injectable()
export class DemoSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoSeedService.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_DEMO !== "true") return;
    await this.runOnce("socle", (client) => this.seedBase(client));
    await this.runOnce("publications-par-thematique", (client) => this.seedExtraPublications(client));
    await this.runOnce("couvertures-publications", (client) => this.seedCovers(client));
    await this.runOnce("textes-publications", (client) => this.seedTexts(client));
  }

  /** Exécute un lot dans une transaction, s'il n'est pas déjà marqué dans demo_seeds. */
  private async runOnce(name: string, seed: (client: PoolClient) => Promise<void>): Promise<void> {
    await runInTransaction(this.pool, async (client) => {
      const marked = await client.query("INSERT INTO demo_seeds (name) VALUES ($1) ON CONFLICT DO NOTHING", [name]);
      if (!marked.rowCount) return;
      await seed(client);
      this.logger.log(`Données de démonstration chargées : ${name}`);
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
      await client.query("INSERT INTO regions (id, name) VALUES ($1, $2)", [regionId(name), name]);
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
          p.excerpt,
          content(p.body),
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
          p.excerpt,
          content(p.body),
          p.date,
          p.sectors,
        ],
      );
    }
  }

  /**
   * Image des publications de démonstration, servie par la passerelle (/demo/publications/<id>.jpg) ;
   * une image déjà choisie dans le back-office est gardée.
   */
  private async seedCovers(client: PoolClient): Promise<void> {
    for (const { id } of [...basePublicationSeeds, ...extraPublicationSeeds]) {
      await client.query("UPDATE publications SET image_url = $2 WHERE id = $1 AND image_url IS NULL", [
        `pub-${id}`,
        `/demo/publications/${id}.jpg`,
      ]);
    }
  }

  /**
   * Titres, dates, résumés et textes définitifs des publications de démonstration, sur une base chargée avec les
   * premiers textes provisoires ; une publication déjà retouchée dans le back-office n'est pas modifiée.
   */
  private async seedTexts(client: PoolClient): Promise<void> {
    for (const p of [...basePublicationSeeds, ...extraPublicationSeeds]) {
      const { rows } = await client.query<{ excerpt: string }>("SELECT excerpt FROM publications WHERE id = $1", [`pub-${p.id}`]);
      if (!rows[0] || !PROVISIONAL_EXCERPT.test(rows[0].excerpt)) continue;
      await client.query(
        "UPDATE publications SET title = $2, date = $3, published_at = $3::date, excerpt = $4, content = $5 WHERE id = $1",
        [`pub-${p.id}`, p.title, p.date, p.excerpt, content(p.body)],
      );
    }
  }
}

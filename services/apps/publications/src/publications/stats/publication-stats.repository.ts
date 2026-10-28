import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { compact, PG_POOL, type PublicationActivity, type PublicationStats, type PublicationStatus } from "@app/common";

const ACTIVITY_LIMIT = 10;

/** Requêtes d'agrégation pour le tableau de bord (lecture seule). */
@Injectable()
export class PublicationStatsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async countByStatus(): Promise<PublicationStats["byStatus"]> {
    const counts: PublicationStats["byStatus"] = { draft: 0, submitted: 0, returned: 0, published: 0 };
    const { rows } = await this.pool.query<{ status: PublicationStatus; count: number }>(
      "SELECT status, count(*)::int AS count FROM publications GROUP BY status",
    );
    for (const row of rows) counts[row.status] = row.count;
    return counts;
  }

  async publishedByLevel(): Promise<PublicationStats["publishedByLevel"]> {
    const { rows } = await this.pool.query<{ national: number; regional: number }>(
      `SELECT count(*) FILTER (WHERE level = 'national')::int AS national,
              count(*) FILTER (WHERE level = 'regional')::int AS regional
       FROM publications WHERE status = 'published'`,
    );
    return rows[0]!;
  }

  async publishedSince(days: number): Promise<number> {
    const { rows } = await this.pool.query<{ count: number }>(
      "SELECT count(*)::int AS count FROM publications WHERE status = 'published' AND published_at >= now() - make_interval(days => $1)",
      [days],
    );
    return rows[0]!.count;
  }

  async publishedByThematique(): Promise<PublicationStats["byThematique"]> {
    const { rows } = await this.pool.query<PublicationStats["byThematique"][number]>(
      `SELECT t.id AS "thematiqueId", t.name, count(p.id) FILTER (WHERE p.status = 'published')::int AS published
       FROM thematiques t LEFT JOIN publications p ON p.thematique_id = t.id
       GROUP BY t.id, t.name
       ORDER BY published DESC, t.name`,
    );
    return rows;
  }

  async recentActivity(): Promise<PublicationActivity[]> {
    const { rows } = await this.pool.query(
      `SELECT r.id, r.publication_id AS "publicationId", p.title, r.action, r.comment,
              r.author_name AS "authorName", r.created_at AS "createdAt"
       FROM publication_reviews r JOIN publications p ON p.id = r.publication_id
       ORDER BY r.created_at DESC, r.id DESC
       LIMIT $1`,
      [ACTIVITY_LIMIT],
    );
    return rows.map((row) => compact<PublicationActivity>({ ...row, createdAt: (row.createdAt as Date).toISOString() }));
  }
}

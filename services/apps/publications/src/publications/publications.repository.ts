import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type AdminPublication, type Db, PG_POOL, type PublicationStatus, SqlRepository, type TableDefinition } from "@app/common";
import type { ListPublicationsQuery } from "./dto/list-publications.query";
import { containsPattern, fold } from "./publication-search";

/** Ligne de la liste publique, avant mise en forme (Publication du contrat). */
/** Ce qu'il faut pour appliquer les règles du workflow, lu sous verrou. */
export interface WorkflowState {
  status: PublicationStatus;
  createdBy?: string;
}

export interface PublicationSummaryRow {
  id: string;
  title: string;
  date: string;
  level: "national" | "regional";
  sectors: string[];
  thematique: string;
}

@Injectable()
export class PublicationsRepository extends SqlRepository<AdminPublication> {
  protected readonly table: TableDefinition = {
    name: "publications",
    label: "Publication",
    idPrefix: "pub",
    columns: {
      title: "title",
      imageUrl: "image_url",
      level: "level",
      regionId: "region_id",
      thematiqueId: "thematique_id",
      excerpt: "excerpt",
      content: "content",
      documents: "documents",
      date: "date",
      latestNipc: "latest_nipc",
      sectors: "sectors",
      status: "status",
      createdBy: "created_by",
      createdByName: "created_by_name",
    },
    computed: {
      // Dernier commentaire de renvoi, seulement tant que la publication est à corriger.
      returnComment: `CASE WHEN publications.status = 'returned' THEN (
        SELECT r.comment FROM publication_reviews r
        WHERE r.publication_id = publications.id AND r.action = 'returned'
        ORDER BY r.created_at DESC LIMIT 1) END`,
    },
    json: ["documents"],
    orderBy: "date DESC, title",
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }

  /** Recherche publique (publications en ligne seulement) : une page de résultats et le total. */
  async search(query: ListPublicationsQuery): Promise<{ rows: PublicationSummaryRow[]; total: number }> {
    const where = `
      WHERE p.status = 'published'
        AND ($1::text IS NULL OR p.level = $1)
        AND ($2::text IS NULL OR p.thematique_id = $2)
        AND ($3::text IS NULL OR p.region_id = $3)
        AND ($4::text IS NULL OR ${fold("p.title")} LIKE ${fold("$4")})
        AND ($5::text[] IS NULL OR p.sectors && $5::text[])`;
    const params = [
      query.scope ?? null,
      query.thematiqueId ?? null,
      query.regionId ?? null,
      query.q?.trim() ? containsPattern(query.q.trim()) : null,
      query.sector?.length ? query.sector : null,
    ];

    const [page, count] = await Promise.all([
      this.pool.query<PublicationSummaryRow>(
        `SELECT p.id, p.title, p.date, p.level, p.sectors, t.name AS thematique
         FROM publications p JOIN thematiques t ON t.id = p.thematique_id ${where}
         ORDER BY p.date DESC, p.title
         LIMIT $6 OFFSET $7`,
        [...params, query.limit, query.offset],
      ),
      this.pool.query<{ total: number }>(`SELECT count(*)::int AS total FROM publications p ${where}`, params),
    ]);
    return { rows: page.rows, total: count.rows[0]!.total };
  }

  /** Retire le marqueur « la plus récente NIPC » des publications en ligne, sauf `exceptId`. */
  async clearLatestNipc(exceptId: string, db: Db): Promise<void> {
    await db.query(
      "UPDATE publications SET latest_nipc = false WHERE latest_nipc AND status = 'published' AND id <> $1",
      [exceptId],
    );
  }

  async touch(id: string, db: Db): Promise<void> {
    await db.query("UPDATE publications SET updated_at = now() WHERE id = $1", [id]);
  }

  /** Statut et auteur, ligne verrouillée jusqu'à la fin de la transaction (null si introuvable). */
  async lockWorkflowState(id: string, db: Db): Promise<WorkflowState | null> {
    const { rows } = await db.query<{ status: PublicationStatus; createdBy: string | null }>(
      `SELECT status, created_by AS "createdBy" FROM publications WHERE id = $1 FOR UPDATE`,
      [id],
    );
    const row = rows[0];
    return row ? { status: row.status, createdBy: row.createdBy ?? undefined } : null;
  }

  /** Change le statut et date l'étape (soumission ou mise en ligne). */
  async setStatus(id: string, status: PublicationStatus, db: Db): Promise<void> {
    await db.query(
      `UPDATE publications SET status = $2, updated_at = now(),
         submitted_at = CASE WHEN $2 = 'submitted' THEN now() ELSE submitted_at END,
         published_at = CASE WHEN $2 = 'published' THEN now() ELSE published_at END
       WHERE id = $1`,
      [id, status],
    );
  }
}

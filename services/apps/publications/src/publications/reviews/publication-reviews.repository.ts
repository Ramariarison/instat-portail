import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { compact, type Db, newId, PG_POOL, type PublicationReview } from "@app/common";

export interface NewReview {
  publicationId: string;
  action: PublicationReview["action"];
  comment?: string;
  authorId: string;
  authorName: string;
}

/** Historique des décisions sur une publication (table publication_reviews). */
@Injectable()
export class PublicationReviewsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async add(review: NewReview, db: Db = this.pool): Promise<void> {
    await db.query(
      `INSERT INTO publication_reviews (id, publication_id, action, comment, author_id, author_name)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [newId("rev"), review.publicationId, review.action, review.comment ?? null, review.authorId, review.authorName],
    );
  }

  async listFor(publicationId: string): Promise<PublicationReview[]> {
    const { rows } = await this.pool.query(
      `SELECT id, action, comment, author_name AS "authorName", created_at AS "createdAt"
       FROM publication_reviews WHERE publication_id = $1 ORDER BY created_at, id`,
      [publicationId],
    );
    return rows.map((row) => compact<PublicationReview>({ ...row, createdAt: (row.createdAt as Date).toISOString() }));
  }
}

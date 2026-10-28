import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import {
  type AdminPublication,
  ApiException,
  PG_POOL,
  type PublicationReview,
  runInTransaction,
  type TokenPayload,
} from "@app/common";
import { PublicationsRepository } from "../publications.repository";
import { PublicationReviewsRepository } from "../reviews/publication-reviews.repository";
import { canTransition, nextStatus, type WorkflowAction } from "./publication-workflow";

const REVIEW_ACTION: Record<WorkflowAction, PublicationReview["action"]> = {
  submit: "submitted",
  publish: "published",
  return: "returned",
};

/**
 * Applique une étape du workflow (soumettre, publier, renvoyer) : contrôle des règles, changement de statut
 * et ajout à l'historique, dans une même transaction.
 */
@Injectable()
export class PublicationWorkflowService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly publications: PublicationsRepository,
    private readonly reviews: PublicationReviewsRepository,
  ) {}

  submit(id: string, actor: TokenPayload): Promise<AdminPublication> {
    return this.apply("submit", id, actor);
  }

  publish(id: string, actor: TokenPayload): Promise<AdminPublication> {
    return this.apply("publish", id, actor);
  }

  /** Renvoi à l'auteur, avec le commentaire qui explique quoi corriger. */
  sendBack(id: string, comment: string, actor: TokenPayload): Promise<AdminPublication> {
    return this.apply("return", id, actor, comment.trim());
  }

  async history(id: string): Promise<PublicationReview[]> {
    await this.publications.getById(id);
    return this.reviews.listFor(id);
  }

  private apply(action: WorkflowAction, id: string, actor: TokenPayload, comment?: string): Promise<AdminPublication> {
    return runInTransaction(this.pool, async (client) => {
      const state = await this.publications.lockWorkflowState(id, client);
      if (!state) throw ApiException.notFound("Publication");

      const decision = canTransition(action, { ...state, actor: { id: actor.sub, role: actor.role } });
      if (!decision.allowed) throw ApiException.fromDecision(decision);

      // Mise en ligne d'une publication marquée « la plus récente NIPC » : elle prend le marqueur aux autres.
      if (action === "publish" && (await this.publications.getById(id, client)).latestNipc) {
        await this.publications.clearLatestNipc(id, client);
      }
      await this.publications.setStatus(id, nextStatus(action), client);
      await this.reviews.add(
        { publicationId: id, action: REVIEW_ACTION[action], comment, authorId: actor.sub, authorName: actor.name },
        client,
      );
      return this.publications.getById(id, client);
    });
  }
}

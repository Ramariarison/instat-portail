import type { Role } from "@app/common";

/**
 * Cycle de vie d'une publication (user stories « soumettre à validation », « valider ou renvoyer avec un commentaire ») :
 *
 *   brouillon ──soumettre──▶ soumise ──publier──▶ publiée
 *       ▲                      │
 *       │                   renvoyer (commentaire obligatoire)
 *       │                      ▼
 *       └────(corrections)── renvoyée ──soumettre──▶ soumise
 *
 * - L'éditeur crée des brouillons, modifie SES brouillons et SES publications renvoyées, puis les soumet.
 * - L'administrateur (et le super administrateur) examine : il publie ou renvoie avec un commentaire.
 *   Il peut aussi publier directement un brouillon, et il est le seul à modifier une publication déjà publiée.
 * - Seules les publications « publiée » apparaissent sur le site public.
 */

export type PublicationStatus = "draft" | "submitted" | "returned" | "published";

export const PUBLICATION_STATUSES: PublicationStatus[] = ["draft", "submitted", "returned", "published"];

export const STATUS_LABELS: Record<PublicationStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumise à validation",
  returned: "Renvoyée pour correction",
  published: "Publiée",
};

export type WorkflowAction = "submit" | "publish" | "return";

/** Ce qu'il faut savoir d'une publication et de la personne qui agit pour appliquer les règles. */
export interface WorkflowContext {
  status: PublicationStatus;
  /** Auteur de la publication (absent pour les publications d'avant le workflow). */
  createdBy?: string;
  actor: { id: string; role: Role };
}

/** Résultat d'une règle : autorisé, ou refusé avec la raison à afficher. */
export type Decision = { allowed: true } | { allowed: false; reason: string };

const allow: Decision = { allowed: true };
const deny = (reason: string): Decision => ({ allowed: false, reason });

export const isReviewer = (role: Role): boolean => role === "admin" || role === "super_admin";

const isAuthor = ({ createdBy, actor }: WorkflowContext): boolean => createdBy === actor.id;

/** Modifier le contenu d'une publication. */
export function canEdit(context: WorkflowContext): Decision {
  if (isReviewer(context.actor.role)) return allow;
  if (!isAuthor(context)) return deny("Vous ne pouvez modifier que vos propres publications.");
  if (context.status === "draft" || context.status === "returned") return allow;
  return context.status === "submitted"
    ? deny("Cette publication est en cours de validation : elle ne peut plus être modifiée.")
    : deny("Cette publication est en ligne : seul un administrateur peut la modifier.");
}

/** Passer d'un statut à l'autre. */
export function canTransition(action: WorkflowAction, context: WorkflowContext): Decision {
  const { status, actor } = context;
  switch (action) {
    case "submit":
      if (status !== "draft" && status !== "returned") return deny("Seul un brouillon ou une publication renvoyée peut être soumis.");
      return isAuthor(context) || isReviewer(actor.role) ? allow : deny("Vous ne pouvez soumettre que vos propres publications.");
    case "publish":
      if (!isReviewer(actor.role)) return deny("Seul un administrateur peut publier.");
      return status === "published" ? deny("Cette publication est déjà en ligne.") : allow;
    case "return":
      if (!isReviewer(actor.role)) return deny("Seul un administrateur peut renvoyer une publication.");
      return status === "submitted" ? allow : deny("Seule une publication soumise peut être renvoyée.");
  }
}

/** Statut atteint après une action autorisée. */
export function nextStatus(action: WorkflowAction): PublicationStatus {
  return { submit: "submitted", publish: "published", return: "returned" }[action] as PublicationStatus;
}

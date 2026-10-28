import { can, type PublicationStatus, type Role } from "@app/common";

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

export type { PublicationStatus };

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

/**
 * Résultat d'une règle : autorisé, ou refusé avec la raison à afficher.
 * `kind` : « forbidden » si la personne n'en a pas le droit (403), « state » si le statut ne le permet pas (409).
 */
export type Decision = { allowed: true } | { allowed: false; kind: "forbidden" | "state"; reason: string };

const allow: Decision = { allowed: true };
const forbidden = (reason: string): Decision => ({ allowed: false, kind: "forbidden", reason });
const wrongState = (reason: string): Decision => ({ allowed: false, kind: "state", reason });

/** Peut examiner (publier, renvoyer) : droit « validate » sur les publications dans la matrice RBAC. */
export const isReviewer = (role: Role): boolean => can(role, "publications", "validate");

const isAuthor = ({ createdBy, actor }: WorkflowContext): boolean => createdBy === actor.id;

/** Modifier le contenu d'une publication. */
export function canEdit(context: WorkflowContext): Decision {
  if (isReviewer(context.actor.role)) return allow;
  if (!isAuthor(context)) return forbidden("Vous ne pouvez modifier que vos propres publications.");
  if (context.status === "draft" || context.status === "returned") return allow;
  return context.status === "submitted"
    ? wrongState("Cette publication est en cours de validation : elle ne peut plus être modifiée.")
    : forbidden("Cette publication est en ligne : seul un administrateur peut la modifier.");
}

/** Passer d'un statut à l'autre. */
export function canTransition(action: WorkflowAction, context: WorkflowContext): Decision {
  const { status, actor } = context;
  switch (action) {
    case "submit":
      if (!isAuthor(context) && !isReviewer(actor.role)) return forbidden("Vous ne pouvez soumettre que vos propres publications.");
      return status === "draft" || status === "returned"
        ? allow
        : wrongState("Seul un brouillon ou une publication renvoyée peut être soumis.");
    case "publish":
      if (!isReviewer(actor.role)) return forbidden("Seul un administrateur peut publier.");
      return status === "published" ? wrongState("Cette publication est déjà en ligne.") : allow;
    case "return":
      if (!isReviewer(actor.role)) return forbidden("Seul un administrateur peut renvoyer une publication.");
      return status === "submitted" ? allow : wrongState("Seule une publication soumise peut être renvoyée.");
  }
}

/** Statut atteint après une action autorisée. */
export function nextStatus(action: WorkflowAction): PublicationStatus {
  return { submit: "submitted", publish: "published", return: "returned" }[action] as PublicationStatus;
}

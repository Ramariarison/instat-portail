import type { Role } from "../types";
import type { AdminPublication, PublicationStatus } from "./data/types";
import { can } from "./permissions";

/**
 * Workflow de validation des publications, côté interface : brouillon → soumise → publiée, ou renvoyée.
 * Mêmes règles que le service Publications (services/apps/publications/src/publications/workflow/) ;
 * ici elles ne servent qu'à montrer ou masquer les boutons, le service les applique de toute façon.
 */

export const statusLabels: Record<PublicationStatus, string> = {
  draft: "Brouillon",
  submitted: "À valider",
  returned: "Renvoyée",
  published: "En ligne",
};

export const statusTones: Record<PublicationStatus, "neutral" | "green" | "red" | "outline"> = {
  draft: "outline",
  submitted: "neutral",
  returned: "red",
  published: "green",
};

export const statusOrder: PublicationStatus[] = ["submitted", "returned", "draft", "published"];

interface Actor {
  id: string;
  role: Role;
}

/** Peut examiner : publier ou renvoyer (administrateur, super administrateur). */
export const isReviewer = (role: Role): boolean => can(role, "publications", "validate");

const isAuthor = (publication: Pick<AdminPublication, "createdBy">, actor: Actor) => publication.createdBy === actor.id;

/** L'éditeur modifie ses brouillons et ses publications renvoyées ; l'administrateur, tout. */
export function canEditPublication(publication: Pick<AdminPublication, "status" | "createdBy">, actor: Actor): boolean {
  if (isReviewer(actor.role)) return true;
  return isAuthor(publication, actor) && (publication.status === "draft" || publication.status === "returned");
}

export function canSubmitPublication(publication: Pick<AdminPublication, "status" | "createdBy">, actor: Actor): boolean {
  const ready = publication.status === "draft" || publication.status === "returned";
  return ready && (isAuthor(publication, actor) || isReviewer(actor.role));
}

/** Pourquoi la publication n'est pas modifiable (texte affiché en tête du formulaire). */
export function lockedReason(publication: Pick<AdminPublication, "status" | "createdBy" | "createdByName">, actor: Actor): string {
  if (!isAuthor(publication, actor)) {
    return `Publication de ${publication.createdByName ?? "un autre éditeur"} : vous pouvez la consulter, pas la modifier.`;
  }
  return publication.status === "submitted"
    ? "Publication en cours de validation : elle redeviendra modifiable si un administrateur vous la renvoie."
    : "Publication en ligne : seul un administrateur peut la modifier.";
}

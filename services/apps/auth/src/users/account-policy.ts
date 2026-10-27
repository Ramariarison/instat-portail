import type { AdminUser, Role } from "@app/common";

/**
 * Qui peut faire quoi sur les comptes (user stories administrateur et super administrateur) :
 *
 * - Super administrateur : tout — créer n'importe quel compte, changer un rôle, suspendre, supprimer.
 * - Administrateur : crée, consulte et modifie les comptes ÉDITEURS (nom, e-mail, mot de passe) ;
 *   il ne crée pas d'administrateur, ne change aucun rôle, ne suspend et ne supprime personne.
 * - Personne ne modifie son propre rôle ni ne se suspend ; personne ne se supprime.
 *
 * Le droit d'accès à la ressource « users » est vérifié avant (matrice RBAC) ; ces règles portent sur le compte visé.
 */

export interface Actor {
  id: string;
  role: Role;
}

export type Decision = { allowed: true } | { allowed: false; code: string; reason: string };

const allow: Decision = { allowed: true };
const deny = (code: string, reason: string): Decision => ({ allowed: false, code, reason });

const ADMIN_LIMIT = "Un administrateur ne gère que les comptes éditeurs.";

export function canCreateAccount(actor: Actor, role: Role): Decision {
  if (actor.role === "super_admin" || role === "editor") return allow;
  return deny("FORBIDDEN", "Un administrateur ne peut créer que des comptes éditeurs.");
}

export interface AccountChange {
  role?: Role;
  active?: boolean;
}

export function canUpdateAccount(actor: Actor, target: Pick<AdminUser, "id" | "role" | "active">, change: AccountChange): Decision {
  const roleChanged = change.role !== undefined && change.role !== target.role;
  const suspended = change.active === false && target.active;
  const statusChanged = change.active !== undefined && change.active !== target.active;

  if (target.id === actor.id && (roleChanged || suspended)) {
    return deny("SELF_LOCKOUT", "Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte.");
  }
  if (actor.role === "super_admin") return allow;
  if (target.role !== "editor" && target.id !== actor.id) return deny("FORBIDDEN", ADMIN_LIMIT);
  if (roleChanged) return deny("FORBIDDEN", "Seul un super administrateur peut changer un rôle.");
  if (statusChanged) return deny("FORBIDDEN", "Seul un super administrateur peut suspendre ou réactiver un compte.");
  return allow;
}

export function canDeleteAccount(actor: Actor, target: Pick<AdminUser, "id">): Decision {
  if (target.id === actor.id) return deny("SELF_LOCKOUT", "Vous ne pouvez pas supprimer votre propre compte.");
  return actor.role === "super_admin" ? allow : deny("FORBIDDEN", "Seul un super administrateur peut supprimer un compte.");
}

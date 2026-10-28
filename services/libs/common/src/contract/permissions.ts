import type { Role } from "./contract.types";

/**
 * Matrice des droits : copie conforme de instat-front-v2/src/admin/permissions.ts.
 * Le front s'en sert pour afficher ou masquer ; ici, elle fait foi (chaque route d'écriture la vérifie).
 */
export type Resource =
  | "thematiques"
  | "regions"
  | "publications"
  | "types"
  | "indicateurs"
  | "figures"
  | "users";

/** « validate » : publier ou renvoyer une publication soumise (workflow de validation). */
export type Action = "view" | "create" | "update" | "delete" | "validate";

const all: Action[] = ["view", "create", "update", "delete"];

/** Actions qui ont un sens pour une ressource : « validate » ne concerne que les publications. */
export function actionsFor(resource: Resource): Action[] {
  return resource === "publications" ? [...all, "validate"] : all;
}

export const permissions: Record<Role, Partial<Record<Resource, Action[]>>> = {
  super_admin: {
    thematiques: all,
    regions: all,
    publications: [...all, "validate"],
    types: all,
    indicateurs: all,
    figures: all,
    users: all,
  },
  // L'administrateur valide les publications et gère les comptes éditeurs (pas les rôles ni les suspensions).
  admin: {
    thematiques: all,
    regions: all,
    publications: [...all, "validate"],
    types: all,
    indicateurs: all,
    figures: all,
    users: ["view", "create", "update"],
  },
  // L'éditeur rédige ses publications et les soumet à validation ; il saisit aussi les données par région.
  // Il ne supprime rien et ne touche pas au reste.
  editor: {
    publications: ["view", "create", "update"],
    figures: ["view", "create", "update"],
  },
};

export function can(role: Role | undefined, resource: Resource, action: Action): boolean {
  return role !== undefined && (permissions[role]?.[resource] ?? []).includes(action);
}

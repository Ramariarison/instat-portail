import type { Role } from "./contract.ts";

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

export type Action = "view" | "create" | "update" | "delete";

const all: Action[] = ["view", "create", "update", "delete"];

export const permissions: Record<Role, Partial<Record<Resource, Action[]>>> = {
  super_admin: {
    thematiques: all,
    regions: all,
    publications: all,
    types: all,
    indicateurs: all,
    figures: all,
    users: all,
  },
  admin: {
    thematiques: all,
    regions: all,
    publications: all,
    types: all,
    indicateurs: all,
    figures: all,
  },
  // L'éditeur rédige et corrige des publications, sans pouvoir les supprimer ni toucher au reste.
  editor: {
    publications: ["view", "create", "update"],
  },
};

export function can(role: Role | undefined, resource: Resource, action: Action): boolean {
  return role !== undefined && (permissions[role]?.[resource] ?? []).includes(action);
}

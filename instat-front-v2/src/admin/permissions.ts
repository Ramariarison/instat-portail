import type { Role } from "../types";

/**
 * Matrice des droits : une seule source de vérité, utilisée par le menu, les gardes de page,
 * les boutons d'action et la page « Rôles et permissions ».
 * Ce n'est qu'un reflet côté interface : les droits réels sont contrôlés par le service d'authentification.
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
  return role !== undefined && (permissions[role][resource] ?? []).includes(action);
}

export const actionLabels: Record<Action, string> = {
  view: "Consulter",
  create: "Créer",
  update: "Modifier",
  delete: "Supprimer",
};

export const actionOrder: Action[] = ["view", "create", "update", "delete"];

export const resourceGroups: { title: string; items: { resource: Resource; label: string }[] }[] = [
  {
    title: "Gestion des publications",
    items: [
      { resource: "thematiques", label: "Thématiques" },
      { resource: "regions", label: "Régions" },
      { resource: "publications", label: "Publications" },
    ],
  },
  {
    title: "Madagascar en chiffres",
    items: [
      { resource: "types", label: "Types de données" },
      { resource: "indicateurs", label: "Indicateurs" },
      { resource: "figures", label: "Données par régions" },
    ],
  },
  {
    title: "Administration",
    items: [{ resource: "users", label: "Utilisateurs et rôles" }],
  },
];

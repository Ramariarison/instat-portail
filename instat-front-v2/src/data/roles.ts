import { BarChart3, FileText, Users, type LucideIcon } from "lucide-react";
import type { Role } from "../types";

export const roleLabels: Record<Role, string> = {
  super_admin: "Super administrateur",
  admin: "Administrateur",
  editor: "Éditeur",
};

/** Ce que chaque rôle peut faire, en une phrase (voir le détail dans admin/permissions.ts). */
export const roleDescriptions: Record<Role, string> = {
  super_admin: "Contrôle total, y compris la gestion des utilisateurs et des rôles.",
  admin: "Gère les publications, les thématiques, les régions et « Madagascar en chiffres ».",
  editor: "Rédige et corrige des publications. Ne peut ni les supprimer, ni gérer le reste.",
};

export interface RoleAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

const publications: RoleAction = { label: "Gérer les publications", href: "#/admin/publications", icon: FileText };
const figures: RoleAction = { label: "Gérer « Madagascar en chiffres »", href: "#/admin/chiffres", icon: BarChart3 };
const users: RoleAction = { label: "Gérer les utilisateurs et les rôles", href: "#/admin/utilisateurs", icon: Users };

/**
 * Raccourcis affichés dans le menu du compte, selon le rôle.
 * Ce n'est qu'un reflet visuel : les droits réels sont contrôlés par le service d'authentification.
 */
export const roleActions: Record<Role, RoleAction[]> = {
  super_admin: [publications, figures, users],
  admin: [publications, figures],
  editor: [{ label: "Rédiger une publication", href: "#/admin/publications/nouvelle", icon: FileText }],
};

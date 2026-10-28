import { BarChart3, FileText, UserRound, Users, type LucideIcon } from "lucide-react";
import type { Role } from "../types";

export const roleLabels: Record<Role, string> = {
  super_admin: "Super administrateur",
  admin: "Administrateur",
  editor: "Éditeur",
};

/** Ce que chaque rôle peut faire, en une phrase (voir le détail dans admin/permissions.ts). */
export const roleDescriptions: Record<Role, string> = {
  super_admin: "Contrôle total, y compris la gestion des utilisateurs et des rôles.",
  admin: "Valide les publications ; gère les thématiques, les régions, « Madagascar en chiffres » et les comptes éditeurs.",
  editor: "Rédige des publications et les soumet à validation ; saisit les données par région. Ne supprime rien.",
};

export interface RoleAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

const publications: RoleAction = { label: "Gérer les publications", href: "#/admin/publications", icon: FileText };
const figures: RoleAction = { label: "Gérer « Madagascar en chiffres »", href: "#/admin/chiffres", icon: BarChart3 };
const users: RoleAction = { label: "Gérer les utilisateurs et les rôles", href: "#/admin/utilisateurs", icon: Users };
const editors: RoleAction = { label: "Gérer les comptes éditeurs", href: "#/admin/utilisateurs", icon: Users };
const account: RoleAction = { label: "Mon compte", href: "#/admin/compte", icon: UserRound };

/**
 * Raccourcis affichés dans le menu du compte, selon le rôle.
 * Ce n'est qu'un reflet visuel : les droits réels sont contrôlés par le service d'authentification.
 */
export const roleActions: Record<Role, RoleAction[]> = {
  super_admin: [publications, figures, users, account],
  admin: [publications, figures, editors, account],
  editor: [
    { label: "Rédiger une publication", href: "#/admin/publications/nouvelle", icon: FileText },
    { label: "Saisir les données par région", href: "#/admin/chiffres/regions", icon: BarChart3 },
    account,
  ],
};

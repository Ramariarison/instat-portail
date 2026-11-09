import { BarChart3, FileText, LayoutDashboard, PenLine, Users, type LucideIcon } from "lucide-react";
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

const dashboard: RoleAction = { label: "Tableau de bord", href: "#/admin", icon: LayoutDashboard };
const publications: RoleAction = { label: "Publications", href: "#/admin/publications", icon: FileText };
const figures: RoleAction = { label: "Madagascar en chiffres", href: "#/admin/chiffres", icon: BarChart3 };
const users: RoleAction = { label: "Utilisateurs et rôles", href: "#/admin/utilisateurs", icon: Users };
const editors: RoleAction = { label: "Comptes éditeurs", href: "#/admin/utilisateurs", icon: Users };

/**
 * Raccourcis vers le back-office affichés dans le menu du compte, selon le rôle (« Mon compte » est à part).
 * Ce n'est qu'un reflet visuel : les droits réels sont contrôlés par le service d'authentification.
 */
export const roleActions: Record<Role, RoleAction[]> = {
  super_admin: [dashboard, publications, figures, users],
  admin: [dashboard, publications, figures, editors],
  editor: [
    dashboard,
    { label: "Rédiger une publication", href: "#/admin/publications/nouvelle", icon: PenLine },
    { label: "Données par région", href: "#/admin/chiffres/regions", icon: BarChart3 },
  ],
};

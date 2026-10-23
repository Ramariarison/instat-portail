import {
  ChartColumn,
  FileText,
  Layers,
  Map,
  MapPin,
  ShieldCheck,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Action, Resource } from "./permissions";

export type AdminRoute =
  | { page: "home" }
  | { page: "thematiques" }
  | { page: "regions" }
  | { page: "publications" }
  | { page: "publication-form"; id?: string }
  | { page: "types" }
  | { page: "indicateurs" }
  | { page: "figures" }
  | { page: "figure-region"; id: string; edit: boolean }
  | { page: "users" }
  | { page: "roles" }
  | { page: "not-found" };

/** `seg` = segments de l'URL après « admin ». */
export function matchAdmin(seg: string[]): AdminRoute {
  const [a, b, c, d] = seg;
  if (!a) return { page: "home" };

  if (a === "publications") {
    if (!b) return { page: "publications" };
    if (b === "thematiques" && !c) return { page: "thematiques" };
    if (b === "regions" && !c) return { page: "regions" };
    if (b === "nouvelle" && !c) return { page: "publication-form" };
    if (b === "modifier" && c && !d) return { page: "publication-form", id: c };
  }

  if (a === "chiffres") {
    if (!b || (b === "types" && !c)) return { page: "types" };
    if (b === "indicateurs" && !c) return { page: "indicateurs" };
    if (b === "regions") {
      if (!c) return { page: "figures" };
      if (!d) return { page: "figure-region", id: c, edit: false };
      if (d === "modifier" && seg.length === 4) return { page: "figure-region", id: c, edit: true };
    }
  }

  if (a === "utilisateurs") {
    if (!b) return { page: "users" };
    if (b === "roles" && !c) return { page: "roles" };
  }

  return { page: "not-found" };
}

/** Droit nécessaire pour ouvrir la page (null = aucune exigence particulière). */
export function requirement(route: AdminRoute): { resource: Resource; action: Action } | null {
  switch (route.page) {
    case "thematiques":
      return { resource: "thematiques", action: "view" };
    case "regions":
      return { resource: "regions", action: "view" };
    case "publications":
      return { resource: "publications", action: "view" };
    case "publication-form":
      return { resource: "publications", action: route.id ? "update" : "create" };
    case "types":
      return { resource: "types", action: "view" };
    case "indicateurs":
      return { resource: "indicateurs", action: "view" };
    case "figures":
      return { resource: "figures", action: "view" };
    case "figure-region":
      return { resource: "figures", action: route.edit ? "update" : "view" };
    case "users":
    case "roles":
      return { resource: "users", action: "view" };
    default:
      return null;
  }
}

export interface AdminNavItem {
  label: string;
  href: string;
  resource: Resource;
  pages: AdminRoute["page"][];
  icon: LucideIcon;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    title: "Gestion des publications",
    items: [
      { label: "Thématiques", href: "#/admin/publications/thematiques", resource: "thematiques", pages: ["thematiques"], icon: Tags },
      { label: "Régions", href: "#/admin/publications/regions", resource: "regions", pages: ["regions"], icon: MapPin },
      { label: "Publications", href: "#/admin/publications", resource: "publications", pages: ["publications", "publication-form"], icon: FileText },
    ],
  },
  {
    title: "Madagascar en chiffres",
    items: [
      { label: "Types de données", href: "#/admin/chiffres/types", resource: "types", pages: ["types"], icon: Layers },
      { label: "Indicateurs", href: "#/admin/chiffres/indicateurs", resource: "indicateurs", pages: ["indicateurs"], icon: ChartColumn },
      { label: "Données par régions", href: "#/admin/chiffres/regions", resource: "figures", pages: ["figures", "figure-region"], icon: Map },
    ],
  },
  {
    title: "Utilisateurs et rôles",
    items: [
      { label: "Utilisateurs", href: "#/admin/utilisateurs", resource: "users", pages: ["users"], icon: Users },
      { label: "Rôles et permissions", href: "#/admin/utilisateurs/roles", resource: "users", pages: ["roles"], icon: ShieldCheck },
    ],
  },
];

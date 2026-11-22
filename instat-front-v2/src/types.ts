import type { LucideIcon } from "lucide-react";

export type Role = "super_admin" | "admin" | "editor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  title?: string;
  links: NavLink[];
}

export interface NavItem {
  label: string;
  href?: string;
  /** Menu large sur toute la largeur de l'en-tête. */
  wide?: boolean;
  groups?: NavGroup[];
}

export interface NewsItem {
  id: string;
  title: string;
  /** Date de tri, AAAA-MM-JJ. */
  date?: string;
  /** Libellé affiché à la place de la date (« 22 et 23 janvier 2026 »). */
  dateLabel?: string;
  context?: string;
  /** Image de l'actualité, adresse renvoyée par le service Fichiers. */
  imageUrl?: string;
  /** Texte de l'actualité, paragraphes séparés par une ligne vide. */
  content?: string;
  /** Page de l'actualité (#/actualites/<id>), ou lien enregistré. */
  href: string;
}

export interface Indicator {
  id: string;
  label: string;
  value: number;
  decimals: number;
  unit: string;
  period: string;
}

export interface Publication {
  id: string;
  title: string;
  date: string;
  kind: string;
  scope: "national" | "regional";
  href: string;
}

export interface Theme {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface ServiceLink {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

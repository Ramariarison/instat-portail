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
  dateLabel?: string;
  context?: string;
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

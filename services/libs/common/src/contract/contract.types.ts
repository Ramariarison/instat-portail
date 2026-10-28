/**
 * Miroir du contrat du front : instat-front-v2/src/types.ts et instat-front-v2/src/admin/data/types.ts.
 * Les réponses JSON des services ont EXACTEMENT ces formes (camelCase, champs optionnels absents plutôt que null).
 * Toute modification doit être faite des deux côtés.
 */

export type Role = "super_admin" | "admin" | "editor";

export const roles: Role[] = ["super_admin", "admin", "editor"];

// --- src/types.ts (site public) ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
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

// --- src/admin/data/types.ts (back-office) ---

export interface Thematique {
  id: string;
  name: string;
  alias: string;
  pictoUrl?: string;
  covid: boolean;
  inMenuPublications: boolean;
  inMenuThemes: boolean;
  inMenuServices: boolean;
}

export interface Region {
  id: string;
  name: string;
  picto: string;
}

export interface PublicationDoc {
  id: string;
  name: string;
  size: number;
}

export interface AdminPublication {
  id: string;
  title: string;
  imageUrl?: string;
  level: "national" | "regional";
  regionId?: string;
  thematiqueId: string;
  excerpt: string;
  content: string;
  documents: PublicationDoc[];
  /** AAAA-MM-JJ */
  date: string;
  latestNipc: boolean;
  sectors: string[];
  /** Workflow de validation : seules les publications « published » sont sur le site public. */
  status: PublicationStatus;
  /** Auteur (absent pour les publications d'avant le workflow). */
  createdBy?: string;
  createdByName?: string;
  /** Dernier commentaire de renvoi, tant que la publication est « returned ». */
  returnComment?: string;
}

export type PublicationStatus = "draft" | "submitted" | "returned" | "published";

/** Tableau de bord du back-office : chiffres sur les publications et activité récente du circuit de validation. */
export interface PublicationStats {
  byStatus: Record<PublicationStatus, number>;
  /** Publications en ligne, par niveau. */
  publishedByLevel: { national: number; regional: number };
  /** Mises en ligne des 30 derniers jours. */
  publishedLast30Days: number;
  /** Publications en ligne par thématique (toutes les thématiques, même vides), de la plus fournie à la moins fournie. */
  byThematique: { thematiqueId: string; name: string; published: number }[];
  /** Dernières étapes du circuit de validation, les plus récentes d'abord. */
  recentActivity: PublicationActivity[];
}

export interface PublicationActivity extends PublicationReview {
  publicationId: string;
  title: string;
}

/** Étape de l'historique d'une publication (soumission, renvoi avec commentaire, publication). */
export interface PublicationReview {
  id: string;
  action: "submitted" | "returned" | "published";
  comment?: string;
  authorName: string;
  /** Date et heure ISO. */
  createdAt: string;
}

export interface DataType {
  id: string;
  name: string;
  picto: string;
}

export interface IndicatorDef {
  id: string;
  typeId: string;
  name: string;
  picto: string;
}

export interface FigureRegion {
  id: string;
  name: string;
  regionId?: string;
}

export interface FigureValue {
  id: string;
  figureRegionId: string;
  indicatorId: string;
  year: number;
  value: number;
  unit: string;
  source: string;
  link?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLogin?: string;
}

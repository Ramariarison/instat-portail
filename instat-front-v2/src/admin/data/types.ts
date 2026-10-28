import type { Role } from "../../types";

export interface Thematique {
  id: string;
  name: string;
  alias: string;
  /** Image du picto (URL de prévisualisation ; le service Fichiers fournira l'URL définitive). */
  pictoUrl?: string;
  covid: boolean;
  inMenuPublications: boolean;
  inMenuThemes: boolean;
  inMenuServices: boolean;
}

export interface Region {
  id: string;
  name: string;
  /** Nom du fichier picto, ex. « analamanga.png ». */
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
  /** Image du titre, exactement 900 × 600 px. */
  imageUrl?: string;
  level: "national" | "regional";
  regionId?: string;
  thematiqueId: string;
  excerpt: string;
  content: string;
  documents: PublicationDoc[];
  /** Date de publication, AAAA-MM-JJ. */
  date: string;
  /** Une seule publication peut porter ce marqueur à la fois. */
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

/** Ce que le formulaire envoie : le statut, l'auteur et les commentaires sont gérés par le service. */
export type PublicationInput = Omit<AdminPublication, "id" | "status" | "createdBy" | "createdByName" | "returnComment">;

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
  /** Nom du fichier picto PNG. */
  picto: string;
}

export interface IndicatorDef {
  id: string;
  typeId: string;
  name: string;
  picto: string;
}

/** Une « région en chiffres » : le niveau national (Madagascar) ou une région. */
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

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

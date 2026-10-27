/** Métadonnées d'un fichier, enregistrées à côté de lui (<id>.json). */
export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

/** Réponse de l'envoi : champs de PublicationDoc (id, name, size), type et adresse publique. */
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

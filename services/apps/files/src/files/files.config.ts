/** Réglages du stockage, lus dans l'environnement. */
export const filesConfig = {
  /** Dossier du volume où sont rangés les fichiers et leurs métadonnées. */
  directory: process.env.FILES_DIR ?? "/data/files",
  /** Taille maximale d'un fichier (50 Mo par défaut). */
  maxBytes: Number(process.env.FILES_MAX_BYTES ?? 50 * 1024 * 1024),
  /** Préfixe des adresses publiques renvoyées au front. */
  publicPrefix: process.env.FILES_PUBLIC_PREFIX ?? "/api/files",
};

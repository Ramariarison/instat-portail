/**
 * Réglages lus au build (variables VITE_*, voir .env.example à la racine du front).
 *
 * SAMPLE_DATA : la page d'accueil affiche les fichiers de src/data au lieu d'interroger l'API
 * (utile pour travailler sur la mise en page sans back-end). Faux par défaut.
 */
export const SAMPLE_DATA = import.meta.env.VITE_SAMPLE_DATA === "true";

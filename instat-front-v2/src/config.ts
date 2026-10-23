/**
 * Réglages lus au build (variables VITE_*, voir .env.example à la racine du front).
 *
 * SAMPLE_DATA : la page d'accueil affiche les fichiers de src/data au lieu d'interroger l'API
 * (utile pour travailler sur la mise en page sans back-end). Faux par défaut.
 *
 * SHOW_DEMO_ACCOUNTS : la fenêtre de connexion propose les comptes de démonstration.
 * Ils n'existent que si les services tournent avec SEED_DEMO=true. Vrai par défaut en développement.
 */
export const SAMPLE_DATA = import.meta.env.VITE_SAMPLE_DATA === "true";
export const SHOW_DEMO_ACCOUNTS = (import.meta.env.VITE_SHOW_DEMO_ACCOUNTS ?? String(import.meta.env.DEV)) === "true";

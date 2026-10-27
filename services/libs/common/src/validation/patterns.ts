/** Formats partagés par les DTO. Les liens sont affichés sur le site public : jamais « javascript: ». */

/** Image : adresse http(s) ou chemin du site (« /api/files/… »), pas d'adresse « //autre-site ». */
export const IMAGE_URL = /^(https?:\/\/|\/(?!\/))\S*$/;

/** Lien : comme une image, ou une ancre du site (« #/actualites/… »). */
export const HREF = /^(https?:\/\/|\/(?!\/)|#)\S*$/;

/** Lien externe : http(s) uniquement. */
export const HTTP_URL = /^https?:\/\/\S+$/;

/** Alias d'URL : minuscules, chiffres et tirets (« eau-assainissement »). */
export const ALIAS = /^[a-z0-9]+(-[a-z0-9]+)*$/;

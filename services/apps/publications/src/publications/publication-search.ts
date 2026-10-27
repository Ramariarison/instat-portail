/**
 * Recherche sans accents ni majuscules dans le SQL (l'extension unaccent demanderait un super-utilisateur) :
 * fold("p.title") → translate(lower(p.title), 'àâ…', 'aa…').
 */
export function fold(sql: string): string {
  return `translate(lower(${sql}), 'àâäáãéèêëíìîïóòôöõúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn')`;
}

/** Motif LIKE « contient », les jokers saisis (%, _, \) étant pris au pied de la lettre. */
export function containsPattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

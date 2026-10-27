const surveys = ["rgph", "eds-md", "mics", "epm", "enempsi", "ehtm", "ensomd", "artisanat-enquete"];

/**
 * « Type » affiché sur le site (Publication.kind), déduit du premier secteur.
 * Le back-office ne saisit pas ce champ : à défaut, on affiche le nom de la thématique.
 */
export function kindOf(level: "national" | "regional", sectorIds: string[], thematiqueName: string): string {
  const sector = sectorIds[0];
  if (sector === "situation-economique" && level === "regional") return "Tableau de bord régional";
  if (sector === "tbe") return "Tableau de bord";
  if (sector === "nipc") return "Indice des prix";
  if (sector === "annuaire") return "Annuaire";
  if (sector === "monographies") return "Monographie";
  if (sector && surveys.includes(sector)) return "Enquête";
  return thematiqueName;
}

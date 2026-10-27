/**
 * Rubriques du menu « Thèmes et données » qui regroupent des publications par SECTEURS
 * (cases « Secteurs concernés » du formulaire de publication). Adresse : #/themes/<slug>.
 *
 * Les autres rubriques sont des THÉMATIQUES du back-office : #/themes/<alias de la thématique>,
 * résolues à l'affichage (une thématique créée dans le back-office a donc sa page sans toucher au code).
 */
export interface SectorCollection {
  slug: string;
  /** Repère au-dessus du titre : le groupe du menu. */
  group: string;
  label: string;
  description: string;
  /** Une publication y figure si elle porte au moins un de ces secteurs (identifiants de admin/data/sectors.ts). */
  sectors: string[];
}

export const sectorCollections: SectorCollection[] = [
  {
    slug: "enquetes-recensements",
    group: "Publications et statistiques",
    label: "Enquêtes et recensements",
    description: "Recensements de la population, enquêtes auprès des ménages, sur l'emploi, la santé ou l'artisanat.",
    sectors: ["rgph", "eds-md", "mics", "epm", "enempsi", "ehtm", "ensomd", "artisanat-enquete"],
  },
  {
    slug: "etudes-analyses",
    group: "Publications et statistiques",
    label: "Études et analyses",
    description: "Monographies régionales, notes sur la situation économique et les investissements étrangers.",
    sectors: ["monographies", "situation-economique", "ide"],
  },
  {
    slug: "annuaires",
    group: "Publications et statistiques",
    label: "Annuaires statistiques",
    description: "Annuaires de Madagascar et annuaires sectoriels : santé, éducation, agriculture…",
    sectors: ["annuaire"],
  },
  {
    slug: "ipc",
    group: "Bases de données",
    label: "Indice des prix à la consommation",
    description: "Publications mensuelles du nouvel indice des prix à la consommation (NIPC).",
    sectors: ["nipc"],
  },
  {
    slug: "rgph-3",
    group: "Bases de données",
    label: "RGPH-3",
    description: "Publications issues du troisième recensement général de la population et de l'habitation.",
    sectors: ["rgph"],
  },
];

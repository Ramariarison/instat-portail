/**
 * DONNÉES D'EXEMPLE (SEED_DEMO=true) : reprises de instat-front-v2/src/admin/data/seed.ts et src/data/news.ts,
 * mêmes identifiants pour que le front retrouve ses repères. Ce ne sont pas des statistiques officielles.
 */

/** Premier lot : les publications du prototype du front (avec un document fictif). */
export interface BasePublicationSeed {
  id: string;
  title: string;
  date: string;
  thematique: string;
  sector: string;
  region?: string;
  nipc?: boolean;
  file: string;
}

/** Second lot : au moins une publication par thématique, sans document joint. */
export interface ExtraPublicationSeed {
  id: string;
  title: string;
  date: string;
  thematique: string;
  sectors: string[];
  region?: string;
}

export const basePublicationSeeds: BasePublicationSeed[] = [
  { id: "tbe-63", title: "Tableau de bord de l'économie (TBE) n° 63", date: "2026-08-24", thematique: "Économie", sector: "tbe", file: "tbe-63.pdf" },
  { id: "nipc-2026-03", title: "Nouvel indice des prix à la consommation (NIPC), mars 2026", date: "2026-04-28", thematique: "Économie", sector: "nipc", nipc: true, file: "nipc-2026-03.pdf" },
  { id: "tbe-62", title: "Tableau de bord de l'économie (TBE) n° 62", date: "2026-04-26", thematique: "Économie", sector: "tbe", file: "tbe-62.pdf" },
  { id: "nipc-2026-02", title: "Nouvel indice des prix à la consommation (NIPC), février 2026", date: "2026-04-02", thematique: "Économie", sector: "nipc", file: "nipc-2026-02.pdf" },
  { id: "mics-7", title: "Enquête par grappes à indicateurs multiples (MICS-7) 2025", date: "2026-02-28", thematique: "Conditions de vie des ménages", sector: "mics", file: "mics-7-rapport.pdf" },
  { id: "nipc-2026-01", title: "Nouvel indice des prix à la consommation (NIPC), janvier 2026", date: "2026-02-26", thematique: "Économie", sector: "nipc", file: "nipc-2026-01.pdf" },
  { id: "analanjirofo-2024", title: "Tableau de bord socio-économique, région Analanjirofo 2024", date: "2026-04-26", thematique: "Économie", sector: "situation-economique", region: "Analanjirofo", file: "tbse-analanjirofo-2024.pdf" },
  { id: "atsinanana-2024", title: "Tableau de bord socio-économique, région Atsinanana 2024", date: "2026-04-26", thematique: "Économie", sector: "situation-economique", region: "Atsinanana", file: "tbse-atsinanana-2024.pdf" },
  { id: "alaotra-mangoro-2024", title: "Tableau de bord socio-économique, région Alaotra-Mangoro 2024", date: "2026-04-26", thematique: "Économie", sector: "situation-economique", region: "Alaotra-Mangoro", file: "tbse-alaotra-mangoro-2024.pdf" },
  { id: "atsinanana-2023", title: "Tableau de bord socio-économique, région Atsinanana 2023", date: "2024-12-17", thematique: "Économie", sector: "situation-economique", region: "Atsinanana", file: "tbse-atsinanana-2023.pdf" },
  { id: "alaotra-mangoro-2023", title: "Tableau de bord socio-économique, région Alaotra-Mangoro 2023", date: "2024-12-11", thematique: "Économie", sector: "situation-economique", region: "Alaotra-Mangoro", file: "tbse-alaotra-mangoro-2023.pdf" },
  { id: "analanjirofo-2023", title: "Tableau de bord socio-économique, région Analanjirofo 2023", date: "2024-12-11", thematique: "Économie", sector: "situation-economique", region: "Analanjirofo", file: "tbse-analanjirofo-2023.pdf" },
];

export const extraPublicationSeeds: ExtraPublicationSeed[] = [
  { id: "rgph-3-resultats", title: "Troisième recensement général de la population et de l'habitation (RGPH-3) : résultats globaux", date: "2025-06-30", thematique: "Démographie et population", sectors: ["rgph"] },
  { id: "projections-2050", title: "Projections démographiques de Madagascar, 2018-2050", date: "2025-09-15", thematique: "Démographie et population", sectors: ["rgph"] },
  { id: "monographie-analamanga", title: "Monographie de la région Analamanga", date: "2025-11-20", thematique: "Démographie et population", sectors: ["monographies"], region: "Analamanga" },
  { id: "eds-md-2021", title: "Enquête démographique et de santé (EDS-MD) 2021 : rapport final", date: "2024-10-10", thematique: "Santé", sectors: ["eds-md", "sante"] },
  { id: "annuaire-sante-2024", title: "Annuaire des statistiques de la santé 2024", date: "2026-03-12", thematique: "Santé", sectors: ["annuaire", "sante"] },
  { id: "enempsi-2022", title: "Enquête nationale sur l'emploi et le secteur informel (ENEMPSI) 2022", date: "2024-07-18", thematique: "Travail", sectors: ["enempsi", "travail"] },
  { id: "marche-travail-2024", title: "Indicateurs du marché du travail 2024", date: "2025-12-05", thematique: "Travail", sectors: ["travail"] },
  { id: "comptes-2023", title: "Comptes nationaux de Madagascar 2023 : comptes provisoires", date: "2025-05-22", thematique: "Comptes nationaux", sectors: ["situation-economique"] },
  { id: "tre-2022", title: "Tableau des ressources et des emplois 2022", date: "2024-11-28", thematique: "Comptes nationaux", sectors: [] },
  { id: "annuaire-agricole-2023", title: "Annuaire statistique agricole 2023", date: "2025-02-14", thematique: "Agriculture, élevage et pêche", sectors: ["annuaire", "agriculture"] },
  { id: "elevage-bovin-2024", title: "Enquête sur l'élevage bovin 2024", date: "2025-10-02", thematique: "Agriculture, élevage et pêche", sectors: ["agriculture"] },
  { id: "annuaire-education-2024", title: "Annuaire des statistiques de l'éducation 2024", date: "2025-08-21", thematique: "Éducation", sectors: ["annuaire", "education"] },
  { id: "eau-assainissement-mics", title: "Accès des ménages à l'eau potable et à l'assainissement (MICS-7)", date: "2026-03-30", thematique: "Eau, assainissement et hygiène", sectors: ["mics", "eau"] },
  { id: "comptes-forets-2023", title: "Comptes de l'environnement : forêts et couverture forestière 2023", date: "2025-04-17", thematique: "Environnement", sectors: ["environnement"] },
  { id: "bilan-energetique-2023", title: "Bilan énergétique national 2023", date: "2025-03-06", thematique: "Énergie et hydrocarbures", sectors: ["energie"] },
  { id: "tourisme-2025", title: "Statistiques du tourisme : arrivées des visiteurs non résidents 2025", date: "2026-02-19", thematique: "Tourisme et artisanat", sectors: ["tourisme"] },
  { id: "artisanat-2024", title: "Enquête sur l'artisanat 2024", date: "2025-07-09", thematique: "Tourisme et artisanat", sectors: ["artisanat-enquete", "tourisme"] },
  { id: "commerce-exterieur-2025", title: "Commerce extérieur de Madagascar 2025", date: "2026-05-14", thematique: "Commerce et consommation", sectors: ["commerce"] },
  { id: "epm-2022", title: "Enquête périodique auprès des ménages (EPM) 2022 : profil de la pauvreté", date: "2024-09-26", thematique: "Conditions de vie des ménages", sectors: ["epm"] },
  { id: "covid-entreprises", title: "Effets de la COVID-19 sur les entreprises : enquête à haute fréquence", date: "2023-08-31", thematique: "Impact de la COVID-19", sectors: ["ehtm"] },
  { id: "ide-2024", title: "Investissements directs étrangers à Madagascar 2024", date: "2025-12-18", thematique: "Économie", sectors: ["ide"] },
  { id: "annuaire-madagascar-2024", title: "Annuaire statistique de Madagascar 2024", date: "2026-01-29", thematique: "Économie", sectors: ["annuaire"] },
];

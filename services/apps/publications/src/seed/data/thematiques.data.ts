/**
 * DONNÉES D'EXEMPLE (SEED_DEMO=true) : reprises de instat-front-v2/src/admin/data/seed.ts et src/data/news.ts,
 * mêmes identifiants pour que le front retrouve ses repères. Ce ne sont pas des statistiques officielles.
 */

export interface ThematiqueSeed {
  name: string;
  covid?: boolean;
  pub?: boolean;
  themes?: boolean;
  services?: boolean;
}

export const thematiqueSeeds: ThematiqueSeed[] = [
  { name: "Économie", pub: true, themes: true },
  { name: "Démographie et population", pub: true, themes: true },
  { name: "Conditions de vie des ménages", pub: true, themes: true },
  { name: "Comptes nationaux", pub: true, themes: true },
  { name: "Agriculture, élevage et pêche", pub: true, themes: true },
  { name: "Éducation", pub: true, themes: true },
  { name: "Santé", pub: true, themes: true },
  { name: "Eau, assainissement et hygiène", pub: true, themes: true },
  { name: "Environnement", pub: true, themes: true },
  { name: "Énergie et hydrocarbures", pub: true, themes: true },
  { name: "Tourisme et artisanat", pub: true, themes: true },
  { name: "Commerce et consommation", pub: true, themes: true },
  { name: "Travail", pub: true, themes: true },
  { name: "Impact de la COVID-19", covid: true, themes: true },
  { name: "Nomenclatures", services: true },
  { name: "Formation et stages", services: true },
];

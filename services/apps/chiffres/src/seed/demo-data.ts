/**
 * DONNÉES D'EXEMPLE (SEED_DEMO=true) : instat-front-v2/src/admin/data/seed.ts et src/data/indicators.ts.
 * Valeurs arrondies : ce ne sont pas des statistiques officielles.
 */

export const regionNames = [
  "Alaotra-Mangoro", "Amoron'i Mania", "Analamanga", "Analanjirofo", "Androy", "Anosy",
  "Atsimo-Andrefana", "Atsimo-Atsinanana", "Atsinanana", "Betsiboka", "Boeny", "Bongolava",
  "Diana", "Haute Matsiatra", "Ihorombe", "Itasy", "Melaky", "Menabe", "Sava", "Sofia",
  "Vakinankaratra", "Vatovavy-Fitovinany",
];

export const typeSeeds: [key: string, name: string][] = [
  ["geo", "Géographie physique"],
  ["pop", "Population et démographie"],
  ["macro", "Macroéconomie"],
  ["emploi", "Emploi"],
  ["env", "Environnement"],
  ["act", "Activités économiques"],
  ["pauv", "Pauvreté et conditions de vie des ménages"],
  ["socio", "Indicateurs sociodémographiques"],
];

export const indicatorSeeds: [type: string, name: string, picto: string][] = [
  ["geo", "Superficie", "superficie.png"],
  ["pop", "Population", "population.png"],
  ["pop", "Population masculine", "population-masculine.png"],
  ["pop", "Population féminine", "population-feminine.png"],
  ["pop", "Population rurale", "population-rurale.png"],
  ["pop", "Population urbaine", "population-urbaine.png"],
  ["pop", "Densité", "densite.png"],
  ["pop", "Population en 2021", "population-2021.png"],
  ["pop", "Taux d'accroissement annuel moyen de la population entre 1993 et 2018", "accroissement.png"],
  ["macro", "PIB courant au prix d'acquisition", "pib.png"],
  ["macro", "Taux de croissance annuel du PIB", "croissance-pib.png"],
  ["macro", "Taux d'inflation en 2021", "inflation.png"],
  ["emploi", "Taux de chômage", "chomage.png"],
  ["env", "Couverture forestière", "foret.png"],
  ["act", "Pourcentage des ménages pratiquant l'agriculture (2018)", "agriculture.png"],
  ["act", "Effectifs des individus ayant l'artisanat comme activité principale (2018)", "artisanat.png"],
  ["act", "Pourcentage des ménages pratiquant l'élevage de bovins (2018)", "elevage-bovins.png"],
  ["pauv", "Taux de pauvreté", "pauvrete.png"],
  ["pauv", "Taux d'accès à l'électricité en 2018", "electricite.png"],
  ["pauv", "Proportion des habitations disposant de latrines améliorées gérées en toute sécurité en 2018", "latrines.png"],
  ["socio", "Taux net de scolarisation au primaire en 2018", "scolarisation.png"],
  ["socio", "Pourcentage des enfants de 0-17 ans possédant un acte de naissance (2018)", "acte-naissance.png"],
  ["socio", "Indice synthétique de fécondité (15-49 ans) en 2018", "fecondite.png"],
];

export const valueSeeds: [figure: string, indicator: string, year: number, value: number, unit: string][] = [
  ["madagascar", "superficie", 2018, 590_000, "km²"],
  ["madagascar", "population", 2018, 25_000_000, "habitants"],
  ["madagascar", "densite", 2018, 42, "hab/km²"],
  ["madagascar", "pib", 2021, 60_000, "milliards d'Ar"],
  ["madagascar", "croissance-pib", 2021, 4, "%"],
  ["madagascar", "inflation", 2021, 6, "%"],
  ["madagascar", "chomage", 2018, 2, "%"],
  ["madagascar", "foret", 2018, 8_500_000, "ha"],
  ["Analamanga", "superficie", 2018, 17_000, "km²"],
  ["Analamanga", "population", 2018, 4_000_000, "habitants"],
  ["Analamanga", "densite", 2018, 235, "hab/km²"],
  ["Atsinanana", "superficie", 2018, 22_000, "km²"],
  ["Atsinanana", "population", 2018, 1_500_000, "habitants"],
  ["Diana", "superficie", 2018, 19_000, "km²"],
  ["Diana", "population", 2018, 800_000, "habitants"],
];

export const keyFigureSeeds: [id: string, label: string, value: number, decimals: number, unit: string, period: string][] = [
  ["population", "Population de Madagascar", 30_000_000, 0, "habitants", "2025"],
  ["pib", "Taux de croissance du PIB", 4, 1, "%", "2025"],
  ["inflation", "Taux d'inflation", 8, 1, "%", "mars 2026"],
  ["nipc-ga", "Glissement annuel des NIPC", 9, 1, "%", "mars 2026"],
  ["nipc-mensuel", "Variation mensuelle des NIPC", 0.5, 1, "%", "mars 2026"],
  ["nipc-trimestriel", "Variation trimestrielle des NIPC", 1.5, 1, "%", "1er trimestre 2026"],
];

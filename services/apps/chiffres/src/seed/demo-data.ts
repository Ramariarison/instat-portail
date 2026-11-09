/**
 * DONNÉES D'EXEMPLE (SEED_DEMO=true) : types et indicateurs de « Madagascar en chiffres » (ceux du portail de l'INSTAT)
 * et choix des chiffres clés de l'accueil. Les valeurs (régions et national) sont dans instat-figures.data.ts.
 */

/** Les 23 régions (découpage de 2021), comme dans le service Publications. */
export const regionNames = [
  "Alaotra-Mangoro", "Amoron'i Mania", "Analamanga", "Analanjirofo", "Androy", "Anosy",
  "Atsimo-Andrefana", "Atsimo-Atsinanana", "Atsinanana", "Betsiboka", "Boeny", "Bongolava",
  "Diana", "Fitovinany", "Ihorombe", "Itasy", "Matsiatra Ambony", "Melaky", "Menabe", "Sava", "Sofia",
  "Vakinankaratra", "Vatovavy",
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
  ["macro", "Taux d'inflation", "inflation.png"],
  ["macro", "Glissement annuel des NIPC", "nipc-glissement-annuel.png"],
  ["macro", "Variation mensuelle des NIPC", "nipc-variation-mensuelle.png"],
  ["macro", "Variation trimestrielle des NIPC", "nipc-variation-trimestrielle.png"],
  ["emploi", "Taux de chômage", "chomage.png"],
  ["env", "Couverture forestière", "foret.png"],
  ["act", "Pourcentage des ménages pratiquant l'agriculture (2018)", "agriculture.png"],
  ["act", "Effectifs des individus ayant l'artisanat comme activité principale (2018)", "artisanat.png"],
  ["act", "Pourcentage des ménages pratiquant l'élevage de bovins (2018)", "elevage-bovins.png"],
  ["pauv", "Taux de pauvreté", "pauvrete.png"],
  ["pauv", "Taux d'accès à l'eau de source améliorée en 2018", "eau.png"],
  ["pauv", "Taux d'accès à l'électricité en 2018", "electricite.png"],
  ["pauv", "Proportion des habitations disposant de latrines améliorées gérées en toute sécurité en 2018", "latrines.png"],
  ["socio", "Taux net de scolarisation au primaire en 2018", "scolarisation.png"],
  ["socio", "Pourcentage des enfants de 0-17 ans possédant un acte de naissance (2018)", "acte-naissance.png"],
  ["socio", "Indice synthétique de fécondité (15-49 ans) en 2018", "fecondite.png"],
];

/**
 * Chiffres clés de l'accueil : indicateurs mis en avant, dans l'ordre (valeur : la plus récente de la fiche nationale).
 * [indicateur, libellé à l'accueil (null : nom de l'indicateur), décimales]
 */
export const keyFigureSeeds: [indicator: string, label: string | null, decimals: number][] = [
  ["population", "Population de Madagascar", 0],
  ["croissance-pib", "Taux de croissance du PIB", 2],
  ["inflation", null, 2],
  ["nipc-glissement-annuel", null, 2],
  ["nipc-variation-mensuelle", null, 2],
  ["nipc-variation-trimestrielle", null, 2],
];

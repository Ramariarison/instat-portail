import type { Indicator } from "../types";

/**
 * Chiffres clés affichés avec VITE_SAMPLE_DATA=true (sans back-end) : mêmes valeurs que les données de démonstration
 * du service Chiffres, relevées sur l'accueil du portail de l'INSTAT.
 */
export const indicators: Indicator[] = [
  { id: "population", label: "Population de Madagascar", value: 30_811_969, decimals: 0, unit: "habitants", period: "2024 (projection)" },
  { id: "pib", label: "Taux de croissance du PIB", value: 4.32, decimals: 2, unit: "%", period: "2024" },
  { id: "inflation", label: "Taux d'inflation", value: 8, decimals: 1, unit: "%", period: "2025" },
  { id: "nipc-ga", label: "Glissement annuel des NIPC", value: 6.77, decimals: 2, unit: "%", period: "mars 2025 – mars 2026" },
  { id: "nipc-mensuel", label: "Variation mensuelle des NIPC", value: 0.67, decimals: 2, unit: "%", period: "février – mars 2026" },
  { id: "nipc-trimestriel", label: "Variation trimestrielle des NIPC", value: 2.7, decimals: 2, unit: "%", period: "décembre 2025 – mars 2026" },
];

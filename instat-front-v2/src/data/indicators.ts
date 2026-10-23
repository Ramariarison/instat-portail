import type { Indicator } from "../types";

/**
 * VALEURS D'EXEMPLE : elles servent à valider la mise en page.
 * Elles seront remplacées par les réponses du service « Madagascar en chiffres ».
 */
export const indicators: Indicator[] = [
  { id: "population", label: "Population de Madagascar", value: 30_000_000, decimals: 0, unit: "habitants", period: "2025" },
  { id: "pib", label: "Taux de croissance du PIB", value: 4, decimals: 1, unit: "%", period: "2025" },
  { id: "inflation", label: "Taux d'inflation", value: 8, decimals: 1, unit: "%", period: "mars 2026" },
  { id: "nipc-ga", label: "Glissement annuel des NIPC", value: 9, decimals: 1, unit: "%", period: "mars 2026" },
  { id: "nipc-mensuel", label: "Variation mensuelle des NIPC", value: 0.5, decimals: 1, unit: "%", period: "mars 2026" },
  { id: "nipc-trimestriel", label: "Variation trimestrielle des NIPC", value: 1.5, decimals: 1, unit: "%", period: "1er trimestre 2026" },
];

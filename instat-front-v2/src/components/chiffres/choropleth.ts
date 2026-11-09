import { slug } from "../../lib/format";

/** Teintes de la carte, de la valeur la plus faible à la plus forte (une seule couleur, de plus en plus foncée). */
const PALETTE = ["#dcebe2", "#a6cbb6", "#6aa486", "#327a5a", "#0d3b2b"];

export interface ColorClass {
  min: number;
  max: number;
  color: string;
}

/**
 * Classes par quantiles (cinq au plus) : chaque teinte regroupe à peu près autant de régions,
 * la carte reste lisible même quand une région (Analamanga) écrase toutes les autres.
 */
export function quantileClasses(values: number[]): ColorClass[] {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  const count = Math.min(PALETTE.length, sorted.length);
  return Array.from({ length: count }, (_, i) => ({
    min: sorted[Math.floor((i * sorted.length) / count)]!,
    max: sorted[Math.floor(((i + 1) * sorted.length) / count) - 1]!,
    // Moins de cinq classes : teintes réparties sur toute la gamme (une seule : teinte du milieu).
    color: PALETTE[count === 1 ? 2 : Math.round((i * (PALETTE.length - 1)) / (count - 1))]!,
  }));
}

export function colorOf(classes: ColorClass[], value: number): string {
  return (classes.find((c) => value <= c.max) ?? classes[classes.length - 1])!.color;
}

/** Anciens noms encore possibles dans les données saisies → nom du fond de carte. */
const ALIASES: Record<string, string> = {
  "haute-matsiatra": "matsiatra-ambony",
};

/** Clé de rapprochement entre une région saisie dans le back-office et une région du fond de carte. */
export function regionKey(name: string): string {
  const key = slug(name);
  return ALIASES[key] ?? key;
}

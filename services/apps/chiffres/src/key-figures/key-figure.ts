import type { Indicator } from "@app/common";

/** Chiffre clé de l'accueil : Indicator du contrat, plus sa position dans la liste. */
export interface KeyFigure extends Indicator {
  position: number;
}

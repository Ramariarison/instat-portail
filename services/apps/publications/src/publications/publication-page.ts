import type { Publication } from "@app/common";

/** Une page de la liste publique ; `total` est renvoyé dans l'en-tête X-Total-Count. */
export interface PublicationPage {
  items: Publication[];
  total: number;
}

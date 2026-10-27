import { randomBytes } from "node:crypto";

/** Identifiant texte préfixé, comme côté front : « pub-3f9c… », « th-… ». */
export function newId(prefix: string): string {
  return `${prefix}-${randomBytes(8).toString("hex")}`;
}

/** Même règle que slug() dans instat-front-v2/src/lib/format.ts : « Eau, assainissement » → « eau-assainissement ». */
export function slug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

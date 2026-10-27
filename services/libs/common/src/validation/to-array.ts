import { Transform } from "class-transformer";

/** Paramètre de requête répétable (?sector=a&sector=b) : une valeur seule devient un tableau. */
export const ToArray = () =>
  Transform(({ value }: { value: unknown }) => (value === undefined || Array.isArray(value) ? value : [value]));

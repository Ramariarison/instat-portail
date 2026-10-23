/** Nom d'un fichier picto PNG déjà présent sur le serveur, par exemple « population.png ». */
const PICTO_PNG = /^[\w\-. ]+\.png$/i;

/** Message d'erreur à afficher sous le champ « fichier picto », ou `undefined` si la saisie est valide. */
export function pictoError(value: string): string | undefined {
  const picto = value.trim();
  if (!picto) return "Saisissez le nom du fichier picto.";
  if (!PICTO_PNG.test(picto)) return "Indiquez un nom de fichier PNG, par exemple : population.png";
  return undefined;
}

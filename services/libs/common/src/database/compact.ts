/** Retire les valeurs null : le contrat du front utilise des champs optionnels, pas des null. */
export function compact<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== null)) as T;
}

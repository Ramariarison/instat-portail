export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Valeur saisie dans le back-office : jusqu'à deux décimales, espaces fines pour les milliers. */
export function formatValue(value: number): string {
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Minuscules sans accents, pour comparer et rechercher. */
export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Vrai si `query` apparaît (sans tenir compte des accents ni de la casse) dans l'un des champs. */
export function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  return fields.some((field) => field !== undefined && normalize(field).includes(q));
}

/** « Eau, assainissement » → « eau-assainissement ». */
export function slug(text: string): string {
  return normalize(text)
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function byName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, "fr");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

/** Accepte « 1 234,5 » comme « 1234.5 ». Renvoie null si ce n'est pas un nombre. */
export function parseNumber(input: string): number | null {
  const cleaned = input.replace(/[\s  ]/g, "").replace(",", ".");
  if (!/^-?\d*\.?\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}

export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

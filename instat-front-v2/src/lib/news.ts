import type { NewsItem } from "../types";
import { formatDate } from "./format";

/** Date affichée d'une actualité : le libellé saisi (« 22 et 23 janvier 2026 »), sinon la date. */
export function newsDateLabel(item: Pick<NewsItem, "date" | "dateLabel">): string | undefined {
  return item.dateLabel ?? (item.date ? formatDate(item.date) : undefined);
}

/** Paragraphes du texte d'une actualité : une ligne vide en sépare deux. */
export function paragraphs(content: string | undefined): string[] {
  return (content ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

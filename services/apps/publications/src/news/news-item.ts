import type { NewsItem } from "@app/common";

/** Actualité telle que stockée : NewsItem du contrat, plus la date de tri (AAAA-MM-JJ). */
export interface StoredNews extends Omit<NewsItem, "href"> {
  date?: string;
  href?: string;
}

/** NewsItem du contrat : sans lien enregistré, l'actualité pointe vers sa page #/actualites/<id>. */
export function toNewsItem(news: StoredNews): NewsItem & { date?: string } {
  return { ...news, href: news.href ?? `#/actualites/${news.id}` };
}

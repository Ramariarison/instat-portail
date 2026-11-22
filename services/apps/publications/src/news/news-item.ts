import type { NewsItem } from "@app/common";

/** Actualité telle que stockée : le lien n'est enregistré que pour les anciennes actualités qui pointaient ailleurs. */
export interface StoredNews extends Omit<NewsItem, "href"> {
  href?: string;
}

/** NewsItem du contrat : sans lien enregistré, l'actualité pointe vers sa page #/actualites/<id>. */
export function toNewsItem(news: StoredNews): NewsItem {
  return { ...news, href: news.href ?? `#/actualites/${news.id}` };
}

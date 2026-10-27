import type { NewsItem } from "@app/common";

/**
 * DONNÉES D'EXEMPLE (SEED_DEMO=true) : reprises de instat-front-v2/src/admin/data/seed.ts et src/data/news.ts,
 * mêmes identifiants pour que le front retrouve ses repères. Ce ne sont pas des statistiques officielles.
 */

export const newsSeeds: (NewsItem & { date?: string })[] = [
  { id: "basan", title: "Convention de partenariat technique entre le Groupe Basan et l'INSTAT", date: "2026-09-02", dateLabel: "2 septembre 2026", context: "Anosy", href: "#/actualites/convention-basan" },
  { id: "rgph-4", title: "Présentation du document de projet (PRODOC) du RGPH-4", date: "2026-05-12", dateLabel: "12 mai 2026", context: "Avec l'UNFPA et la Banque mondiale", href: "#/actualites/prodoc-rgph-4" },
  { id: "interoperabilite", title: "Lancement officiel de l'interopérabilité nationale", date: "2026-04-28", dateLabel: "28 avril 2026", href: "#/actualites/interoperabilite" },
  { id: "producteurs-utilisateurs", title: "Rencontre des producteurs et utilisateurs de données", date: "2026-01-22", dateLabel: "22 et 23 janvier 2026", context: "Projet STATCAP-II", href: "#/actualites/producteurs-utilisateurs" },
  { id: "jms-jas", title: "Célébration de la JMS et de la JAS 2025", date: "2025-11-20", dateLabel: "20 et 21 novembre 2025", href: "#/actualites/jms-jas-2025" },
  { id: "passation", title: "Passation de service au poste de Directeur général", date: "2025-09-10", dateLabel: "10 septembre 2025", href: "#/actualites/passation-dg" },
  { id: "strategie-anticorruption", title: "Stratégie nationale de lutte contre la corruption 2025-2030", href: "#/actualites/strategie-anticorruption" },
];

import type pg from "pg";
import type { NewsItem } from "../../shared/contract.ts";
import { transaction } from "../../shared/db.ts";
import { slug } from "../../shared/ids.ts";

/**
 * Données d'exemple, reprises de instat-front-v2/src/admin/data/seed.ts et src/data/news.ts
 * (mêmes identifiants, pour que le front retrouve ses repères). Chargées si SEED_DEMO=true et la base vide.
 */

export const regionNames = [
  "Alaotra-Mangoro", "Amoron'i Mania", "Analamanga", "Analanjirofo", "Androy", "Anosy",
  "Atsimo-Andrefana", "Atsimo-Atsinanana", "Atsinanana", "Betsiboka", "Boeny", "Bongolava",
  "Diana", "Haute Matsiatra", "Ihorombe", "Itasy", "Melaky", "Menabe", "Sava", "Sofia",
  "Vakinankaratra", "Vatovavy-Fitovinany",
];

export const regionId = (name: string) => `reg-${slug(name)}`;

const thematiqueSeeds: { name: string; covid?: boolean; pub?: boolean; themes?: boolean; services?: boolean }[] = [
  { name: "Économie", pub: true, themes: true },
  { name: "Démographie et population", pub: true, themes: true },
  { name: "Conditions de vie des ménages", pub: true, themes: true },
  { name: "Comptes nationaux", pub: true, themes: true },
  { name: "Agriculture, élevage et pêche", pub: true, themes: true },
  { name: "Éducation", pub: true, themes: true },
  { name: "Santé", pub: true, themes: true },
  { name: "Eau, assainissement et hygiène", pub: true, themes: true },
  { name: "Environnement", pub: true, themes: true },
  { name: "Énergie et hydrocarbures", pub: true, themes: true },
  { name: "Tourisme et artisanat", pub: true, themes: true },
  { name: "Commerce et consommation", pub: true, themes: true },
  { name: "Travail", pub: true, themes: true },
  { name: "Impact de la COVID-19", covid: true, themes: true },
  { name: "Nomenclatures", services: true },
  { name: "Formation et stages", services: true },
];

const pubSeeds: {
  id: string; title: string; date: string; thematique: string; sector: string;
  region?: string; nipc?: boolean; file: string;
}[] = [
  { id: "tbe-63", title: "Tableau de bord de l'économie (TBE) n° 63", date: "2026-08-24", thematique: "Économie", sector: "tbe", file: "tbe-63.pdf" },
  { id: "nipc-2026-03", title: "Nouvel indice des prix à la consommation (NIPC), mars 2026", date: "2026-04-28", thematique: "Économie", sector: "nipc", nipc: true, file: "nipc-2026-03.pdf" },
  { id: "tbe-62", title: "Tableau de bord de l'économie (TBE) n° 62", date: "2026-04-26", thematique: "Économie", sector: "tbe", file: "tbe-62.pdf" },
  { id: "nipc-2026-02", title: "Nouvel indice des prix à la consommation (NIPC), février 2026", date: "2026-04-02", thematique: "Économie", sector: "nipc", file: "nipc-2026-02.pdf" },
  { id: "mics-7", title: "Enquête par grappes à indicateurs multiples (MICS-7) 2025", date: "2026-02-28", thematique: "Conditions de vie des ménages", sector: "mics", file: "mics-7-rapport.pdf" },
  { id: "nipc-2026-01", title: "Nouvel indice des prix à la consommation (NIPC), janvier 2026", date: "2026-02-26", thematique: "Économie", sector: "nipc", file: "nipc-2026-01.pdf" },
  { id: "analanjirofo-2024", title: "Tableau de bord socio-économique, région Analanjirofo 2024", date: "2026-04-26", thematique: "Économie", sector: "situation-economique", region: "Analanjirofo", file: "tbse-analanjirofo-2024.pdf" },
  { id: "atsinanana-2024", title: "Tableau de bord socio-économique, région Atsinanana 2024", date: "2026-04-26", thematique: "Économie", sector: "situation-economique", region: "Atsinanana", file: "tbse-atsinanana-2024.pdf" },
  { id: "alaotra-mangoro-2024", title: "Tableau de bord socio-économique, région Alaotra-Mangoro 2024", date: "2026-04-26", thematique: "Économie", sector: "situation-economique", region: "Alaotra-Mangoro", file: "tbse-alaotra-mangoro-2024.pdf" },
  { id: "atsinanana-2023", title: "Tableau de bord socio-économique, région Atsinanana 2023", date: "2024-12-17", thematique: "Économie", sector: "situation-economique", region: "Atsinanana", file: "tbse-atsinanana-2023.pdf" },
  { id: "alaotra-mangoro-2023", title: "Tableau de bord socio-économique, région Alaotra-Mangoro 2023", date: "2024-12-11", thematique: "Économie", sector: "situation-economique", region: "Alaotra-Mangoro", file: "tbse-alaotra-mangoro-2023.pdf" },
  { id: "analanjirofo-2023", title: "Tableau de bord socio-économique, région Analanjirofo 2023", date: "2024-12-11", thematique: "Économie", sector: "situation-economique", region: "Analanjirofo", file: "tbse-analanjirofo-2023.pdf" },
];

const newsSeeds: (NewsItem & { date?: string })[] = [
  { id: "basan", title: "Convention de partenariat technique entre le Groupe Basan et l'INSTAT", date: "2026-09-02", dateLabel: "2 septembre 2026", context: "Anosy", href: "#/actualites/convention-basan" },
  { id: "rgph-4", title: "Présentation du document de projet (PRODOC) du RGPH-4", date: "2026-05-12", dateLabel: "12 mai 2026", context: "Avec l'UNFPA et la Banque mondiale", href: "#/actualites/prodoc-rgph-4" },
  { id: "interoperabilite", title: "Lancement officiel de l'interopérabilité nationale", date: "2026-04-28", dateLabel: "28 avril 2026", href: "#/actualites/interoperabilite" },
  { id: "producteurs-utilisateurs", title: "Rencontre des producteurs et utilisateurs de données", date: "2026-01-22", dateLabel: "22 et 23 janvier 2026", context: "Projet STATCAP-II", href: "#/actualites/producteurs-utilisateurs" },
  { id: "jms-jas", title: "Célébration de la JMS et de la JAS 2025", date: "2025-11-20", dateLabel: "20 et 21 novembre 2025", href: "#/actualites/jms-jas-2025" },
  { id: "passation", title: "Passation de service au poste de Directeur général", date: "2025-09-10", dateLabel: "10 septembre 2025", href: "#/actualites/passation-dg" },
  { id: "strategie-anticorruption", title: "Stratégie nationale de lutte contre la corruption 2025-2030", href: "#/actualites/strategie-anticorruption" },
];

export async function seedDemo(pool: pg.Pool): Promise<void> {
  const { rows } = await pool.query<{ count: number }>("SELECT count(*)::int AS count FROM thematiques");
  if (rows[0].count > 0) return;

  await transaction(pool, async (client) => {
    for (const t of thematiqueSeeds) {
      await client.query(
        `INSERT INTO thematiques (id, name, alias, covid, in_menu_publications, in_menu_themes, in_menu_services)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [`th-${slug(t.name)}`, t.name, slug(t.name), Boolean(t.covid), Boolean(t.pub), Boolean(t.themes), Boolean(t.services)],
      );
    }
    for (const name of regionNames) {
      await client.query("INSERT INTO regions (id, name, picto) VALUES ($1, $2, $3)", [regionId(name), name, `${slug(name)}.png`]);
    }
    for (const p of pubSeeds) {
      await client.query(
        `INSERT INTO publications (id, title, level, region_id, thematique_id, excerpt, content, documents, date, latest_nipc, sectors)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          `pub-${p.id}`,
          p.title,
          p.region ? "regional" : "national",
          p.region ? regionId(p.region) : null,
          `th-${slug(p.thematique)}`,
          `Publication de l'INSTAT : ${p.title}.`,
          `${p.title}.\n\nContenu d'exemple, à remplacer par le texte de la publication.`,
          JSON.stringify([{ id: `doc-${p.id}`, name: p.file, size: 1_250_000 }]),
          p.date,
          Boolean(p.nipc),
          [p.sector],
        ],
      );
    }
    for (const n of newsSeeds) {
      await client.query(
        "INSERT INTO news (id, title, date, date_label, context, href) VALUES ($1, $2, $3, $4, $5, $6)",
        [n.id, n.title, n.date ?? null, n.dateLabel ?? null, n.context ?? null, n.href],
      );
    }
  });
}

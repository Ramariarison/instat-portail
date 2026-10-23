import type pg from "pg";
import { transaction } from "../../shared/db.ts";
import { slug } from "../../shared/ids.ts";

/**
 * DONNÉES D'EXEMPLE (instat-front-v2/src/admin/data/seed.ts et src/data/indicators.ts) : valeurs arrondies,
 * ce ne sont pas des statistiques officielles. Chargées si SEED_DEMO=true et la base vide.
 */

const regionNames = [
  "Alaotra-Mangoro", "Amoron'i Mania", "Analamanga", "Analanjirofo", "Androy", "Anosy",
  "Atsimo-Andrefana", "Atsimo-Atsinanana", "Atsinanana", "Betsiboka", "Boeny", "Bongolava",
  "Diana", "Haute Matsiatra", "Ihorombe", "Itasy", "Melaky", "Menabe", "Sava", "Sofia",
  "Vakinankaratra", "Vatovavy-Fitovinany",
];

// Même identifiant que la région du service Publications.
const regionId = (name: string) => `reg-${slug(name)}`;

const typeSeeds: [key: string, name: string][] = [
  ["geo", "Géographie physique"],
  ["pop", "Population et démographie"],
  ["macro", "Macroéconomie"],
  ["emploi", "Emploi"],
  ["env", "Environnement"],
  ["act", "Activités économiques"],
  ["pauv", "Pauvreté et conditions de vie des ménages"],
  ["socio", "Indicateurs sociodémographiques"],
];

const indicatorSeeds: [type: string, name: string, picto: string][] = [
  ["geo", "Superficie", "superficie.png"],
  ["pop", "Population", "population.png"],
  ["pop", "Population masculine", "population-masculine.png"],
  ["pop", "Population féminine", "population-feminine.png"],
  ["pop", "Population rurale", "population-rurale.png"],
  ["pop", "Population urbaine", "population-urbaine.png"],
  ["pop", "Densité", "densite.png"],
  ["pop", "Population en 2021", "population-2021.png"],
  ["pop", "Taux d'accroissement annuel moyen de la population entre 1993 et 2018", "accroissement.png"],
  ["macro", "PIB courant au prix d'acquisition", "pib.png"],
  ["macro", "Taux de croissance annuel du PIB", "croissance-pib.png"],
  ["macro", "Taux d'inflation en 2021", "inflation.png"],
  ["emploi", "Taux de chômage", "chomage.png"],
  ["env", "Couverture forestière", "foret.png"],
  ["act", "Pourcentage des ménages pratiquant l'agriculture (2018)", "agriculture.png"],
  ["act", "Effectifs des individus ayant l'artisanat comme activité principale (2018)", "artisanat.png"],
  ["act", "Pourcentage des ménages pratiquant l'élevage de bovins (2018)", "elevage-bovins.png"],
  ["pauv", "Taux de pauvreté", "pauvrete.png"],
  ["pauv", "Taux d'accès à l'électricité en 2018", "electricite.png"],
  ["pauv", "Proportion des habitations disposant de latrines améliorées gérées en toute sécurité en 2018", "latrines.png"],
  ["socio", "Taux net de scolarisation au primaire en 2018", "scolarisation.png"],
  ["socio", "Pourcentage des enfants de 0-17 ans possédant un acte de naissance (2018)", "acte-naissance.png"],
  ["socio", "Indice synthétique de fécondité (15-49 ans) en 2018", "fecondite.png"],
];

const valueSeeds: [figure: string, indicator: string, year: number, value: number, unit: string][] = [
  ["madagascar", "superficie", 2018, 590_000, "km²"],
  ["madagascar", "population", 2018, 25_000_000, "habitants"],
  ["madagascar", "densite", 2018, 42, "hab/km²"],
  ["madagascar", "pib", 2021, 60_000, "milliards d'Ar"],
  ["madagascar", "croissance-pib", 2021, 4, "%"],
  ["madagascar", "inflation", 2021, 6, "%"],
  ["madagascar", "chomage", 2018, 2, "%"],
  ["madagascar", "foret", 2018, 8_500_000, "ha"],
  ["Analamanga", "superficie", 2018, 17_000, "km²"],
  ["Analamanga", "population", 2018, 4_000_000, "habitants"],
  ["Analamanga", "densite", 2018, 235, "hab/km²"],
  ["Atsinanana", "superficie", 2018, 22_000, "km²"],
  ["Atsinanana", "population", 2018, 1_500_000, "habitants"],
  ["Diana", "superficie", 2018, 19_000, "km²"],
  ["Diana", "population", 2018, 800_000, "habitants"],
];

const keyFigureSeeds: [id: string, label: string, value: number, decimals: number, unit: string, period: string][] = [
  ["population", "Population de Madagascar", 30_000_000, 0, "habitants", "2025"],
  ["pib", "Taux de croissance du PIB", 4, 1, "%", "2025"],
  ["inflation", "Taux d'inflation", 8, 1, "%", "mars 2026"],
  ["nipc-ga", "Glissement annuel des NIPC", 9, 1, "%", "mars 2026"],
  ["nipc-mensuel", "Variation mensuelle des NIPC", 0.5, 1, "%", "mars 2026"],
  ["nipc-trimestriel", "Variation trimestrielle des NIPC", 1.5, 1, "%", "1er trimestre 2026"],
];

export async function seedDemo(pool: pg.Pool): Promise<void> {
  const { rows } = await pool.query<{ count: number }>("SELECT count(*)::int AS count FROM data_types");
  if (rows[0].count > 0) return;

  await transaction(pool, async (client) => {
    for (const [key, name] of typeSeeds) {
      await client.query("INSERT INTO data_types (id, name, picto) VALUES ($1, $2, $3)", [`type-${key}`, name, `${slug(name)}.png`]);
    }
    for (const [type, name, picto] of indicatorSeeds) {
      await client.query("INSERT INTO indicator_defs (id, type_id, name, picto) VALUES ($1, $2, $3, $4)", [
        `ind-${picto.replace(".png", "")}`, `type-${type}`, name, picto,
      ]);
    }
    await client.query("INSERT INTO figure_regions (id, name) VALUES ('fr-madagascar', 'Madagascar')");
    for (const name of regionNames) {
      await client.query("INSERT INTO figure_regions (id, name, region_id) VALUES ($1, $2, $3)", [`fr-${regionId(name)}`, name, regionId(name)]);
    }
    for (const [figure, indicator, year, value, unit] of valueSeeds) {
      await client.query(
        `INSERT INTO figure_values (id, figure_region_id, indicator_id, year, value, unit, source)
         VALUES ($1, $2, $3, $4, $5, $6, 'Exemple (à remplacer)')`,
        [
          `val-${figure}-${indicator}`,
          figure === "madagascar" ? "fr-madagascar" : `fr-${regionId(figure)}`,
          `ind-${indicator}`,
          year,
          value,
          unit,
        ],
      );
    }
    for (const [index, [id, label, value, decimals, unit, period]] of keyFigureSeeds.entries()) {
      await client.query(
        "INSERT INTO key_figures (id, label, value, decimals, unit, period, position) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [id, label, value, decimals, unit, period, index],
      );
    }
  });
}

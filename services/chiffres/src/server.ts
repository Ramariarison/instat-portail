import { nullable, registerCrud, text } from "../../shared/crud.ts";
import { createPool, migrate } from "../../shared/db.ts";
import { createApp, start } from "../../shared/http.ts";
import { seedDemo } from "./seed.ts";

/**
 * Service « Madagascar en chiffres ». Lecture publique, écriture selon la matrice RBAC.
 *   /indicators            chiffres clés de la page d'accueil (contrat Indicator), ressource « figures »
 *   /chiffres/types        types de données (DataType), ressource « types »
 *   /chiffres/indicators   indicateurs (IndicatorDef), ressource « indicateurs », filtre ?typeId=
 *   /chiffres/regions      régions en chiffres (FigureRegion) ; la suppression efface leurs valeurs
 *   /chiffres/values       valeurs (FigureValue), filtres ?figureRegionId= et ?indicatorId=
 */

const pool = createPool();
await migrate(pool, new URL("../migrations", import.meta.url).pathname);
if (process.env.SEED_DEMO === "true") await seedDemo(pool);

const app = createApp("chiffres");

const picto = text(255, 0);

registerCrud(app, pool, {
  prefix: "/indicators",
  resource: "figures",
  publicRead: true,
  table: {
    name: "key_figures",
    label: "Chiffre clé",
    idPrefix: "kf",
    columns: { label: "label", value: "value", decimals: "decimals", unit: "unit", period: "period", position: "position" },
    orderBy: "position, label",
  },
  properties: {
    label: text(300),
    value: { type: "number" },
    decimals: { type: "integer", minimum: 0, maximum: 6 },
    unit: text(50, 0),
    period: text(100),
    position: { type: "integer" },
  },
  required: ["label", "value", "decimals", "unit", "period"],
});

registerCrud(app, pool, {
  prefix: "/chiffres/types",
  resource: "types",
  publicRead: true,
  table: { name: "data_types", label: "Type de données", idPrefix: "type", columns: { name: "name", picto: "picto" }, orderBy: "name" },
  properties: { name: text(200), picto },
  required: ["name", "picto"],
});

registerCrud(app, pool, {
  prefix: "/chiffres/indicators",
  resource: "indicateurs",
  publicRead: true,
  filters: ["typeId"],
  table: {
    name: "indicator_defs",
    label: "Indicateur",
    idPrefix: "ind",
    columns: { typeId: "type_id", name: "name", picto: "picto" },
    orderBy: "name",
  },
  properties: { typeId: text(100), name: text(300), picto },
  required: ["typeId", "name", "picto"],
});

registerCrud(app, pool, {
  prefix: "/chiffres/regions",
  resource: "figures",
  publicRead: true,
  table: {
    name: "figure_regions",
    label: "Région en chiffres",
    idPrefix: "fr",
    columns: { name: "name", regionId: "region_id" },
    // Madagascar (niveau national) en tête, puis les régions par nom.
    orderBy: "region_id IS NOT NULL, name",
  },
  properties: { name: text(200), regionId: nullable(text(100)) },
  required: ["name"],
});

registerCrud(app, pool, {
  prefix: "/chiffres/values",
  resource: "figures",
  publicRead: true,
  filters: ["figureRegionId", "indicatorId"],
  table: {
    name: "figure_values",
    label: "Valeur",
    idPrefix: "val",
    columns: {
      figureRegionId: "figure_region_id",
      indicatorId: "indicator_id",
      year: "year",
      value: "value",
      unit: "unit",
      source: "source",
      link: "link",
    },
    orderBy: "year DESC, indicator_id",
  },
  properties: {
    figureRegionId: text(100),
    indicatorId: text(100),
    year: { type: "integer", minimum: 1900, maximum: 2100 },
    value: { type: "number" },
    unit: text(50),
    source: text(500),
    // http(s) seulement : le lien est affiché sur le site public (pas de « javascript: »).
    link: nullable({ type: "string", pattern: "^https?://[^\\s]+$", maxLength: 2048 }),
  },
  required: ["figureRegionId", "indicatorId", "year", "value", "unit", "source"],
});

await start(app, pool);

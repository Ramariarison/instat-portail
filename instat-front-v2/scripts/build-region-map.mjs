/**
 * Fond de carte des 23 régions de Madagascar (découpage de 2021) → src/data/regionMap.ts.
 *
 * Sources (geoBoundaries, https://www.geoboundaries.org) :
 * - districts (ADM2, 119) : BNGRC / OCHA ROSA, licence CC BY 3.0 IGO ;
 * - régions d'avant 2021 (ADM1, 22) : OpenStreetMap, licence ODbL, pour savoir à quelle région appartient un district.
 * Les districts sont regroupés par région (frontières communes exactes), Vatovavy-Fitovinany est scindée en deux.
 *
 * Lancement (Node 22+, depuis instat-front-v2/, fichiers *_simplified.geojson téléchargés depuis geoBoundaries) :
 *   npm i --no-save d3-geo topojson-server topojson-client topojson-simplify
 *   node scripts/build-region-map.mjs adm1.geojson adm2.geojson
 */
import fs from "node:fs";
import { geoArea, geoCentroid, geoContains, geoMercator, geoPath } from "d3-geo";
import { topology } from "topojson-server";
import { merge } from "topojson-client";
import { presimplify, simplify, quantile } from "topojson-simplify";

const [adm1, adm2] = process.argv.slice(2, 4).map((file) => JSON.parse(fs.readFileSync(file, "utf8")));
const fix = (g) => {
  // geoBoundaries tourne ses anneaux dans le sens inverse de d3 : on les retourne si l'aire dépasse une demi-sphère.
  for (const f of g.features) if (geoArea(f) > 2 * Math.PI) {
    const rings = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of rings) for (const ring of poly) ring.reverse();
  }
};
fix(adm1); fix(adm2);

const vatovavy = new Set(["Mananjary", "Nosy-Varika", "Ifanadiana"]);
const fitovinany = new Set(["Manakara Atsimo", "Vohipeno", "Ikongo"]);

const regionOf = (district) => {
  const name = district.properties.shapeName;
  if (vatovavy.has(name)) return "Vatovavy";
  if (fitovinany.has(name)) return "Fitovinany";
  const c = geoCentroid(district);
  let hit = adm1.features.find((r) => geoContains(r, c));
  if (!hit) {
    // Centre en mer (district côtier découpé) : région la plus proche par son centre.
    hit = adm1.features.reduce((best, r) => {
      const rc = geoCentroid(r), d = (rc[0] - c[0]) ** 2 + (rc[1] - c[1]) ** 2;
      return !best || d < best.d ? { r, d } : best;
    }, null).r;
    console.error("hors région :", name, "→", hit.properties.shapeName);
  }
  return hit.properties.shapeName;
};

const groups = new Map();
adm2.features.forEach((d, i) => {
  const region = regionOf(d);
  if (region === "Vatovavy-Fitovinany") throw new Error(`district non réparti : ${d.properties.shapeName}`);
  d.properties = { region };
  groups.set(region, [...(groups.get(region) ?? []), i]);
});

let topo = topology({ districts: adm2 }, 1e5);
// Simplification : on garde 92 % des points (assez pour une carte de 400 px de large).
topo = presimplify(topo);
topo = simplify(topo, quantile(topo, 0.08));
const geoms = topo.objects.districts.geometries;

const regions = [...groups].sort(([a], [b]) => a.localeCompare(b, "fr")).map(([name, idx]) => ({
  name,
  geometry: merge(topo, idx.map((i) => geoms[i])),
  districts: idx.length,
}));
const all = { type: "FeatureCollection", features: regions.map((r) => ({ type: "Feature", properties: {}, geometry: r.geometry })) };

const W = 400;
const projection = geoMercator().fitWidth(W - 8, all);
const [[, y0], [, y1]] = geoPath(projection).bounds(all);
const H = Math.ceil(y1 - y0 + 8);
projection.fitExtent([[4, 4], [W - 4, H - 4]], all);
const path = geoPath(projection).digits(1);

// Aires d'après les districts non simplifiés.
const R = 6371.0088;
const areaOf = (name) => Math.round(adm2.features.filter((d) => d.properties.region === name).reduce((s, d) => s + geoArea(d), 0) * R * R);

const out = regions.map((r) => ({ name: r.name, districts: r.districts, km2: areaOf(r.name), d: path(r.geometry) }));
console.error(out.map((r) => `${r.name} : ${r.districts} districts, ${r.km2} km²`).join("\n"));

const ts = `// Fichier produit par scripts/build-region-map.mjs : ne pas modifier à la main.
// Contours : geoBoundaries — districts BNGRC / OCHA ROSA (CC BY 3.0 IGO), régions OpenStreetMap (ODbL).

/** Une région de Madagascar (découpage de 2021) et son contour, projeté pour le cadre MAP_WIDTH × MAP_HEIGHT. */
export interface MapRegion {
  name: string;
  /** Tracé SVG (attribut d). */
  d: string;
}

export const MAP_WIDTH = ${W};
export const MAP_HEIGHT = ${H};

export const mapRegions: MapRegion[] = [
${out.map((r) => `  { name: ${JSON.stringify(r.name)}, d: ${JSON.stringify(r.d)} },`).join("\n")}
];
`;
fs.writeFileSync("src/data/regionMap.ts", ts);

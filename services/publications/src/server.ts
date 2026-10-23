import type { AdminPublication, NewsItem, Publication } from "../../shared/contract.ts";
import { findAll, findOne, idParams, insertRow, nullable, registerCrud, text, type Table, updateRow } from "../../shared/crud.ts";
import { createPool, migrate, transaction } from "../../shared/db.ts";
import { createApp, HttpError, notFound, requirePermission, start } from "../../shared/http.ts";
import { seedDemo } from "./seed.ts";
import { kindOf, sectors } from "./sectors.ts";

/**
 * Service Publications.
 *   Site public (sans connexion) :
 *     GET /publications?scope=national|regional&limit=6   Publication[] (contrat de la page d'accueil)
 *     GET /publications/latest-nipc                       publication marquée « la plus récente NIPC »
 *     GET /publications/:id                               détail (AdminPublication)
 *     GET /news?limit=7                                   NewsItem[] (les plus récentes d'abord)
 *     GET /thematiques, /regions, /sectors
 *   Back-office (jeton + matrice RBAC) :
 *     /admin/publications       CRUD AdminPublication (ressource « publications »)
 *     /thematiques, /regions    POST / PATCH / DELETE
 *     /news                     POST / PATCH / DELETE (ressource « publications »)
 */

const pool = createPool();
await migrate(pool, new URL("../migrations", import.meta.url).pathname);
if (process.env.SEED_DEMO === "true") await seedDemo(pool);

const app = createApp("publications");

// Liens affichés sur le site public : adresses http(s), chemins du site ou ancres (jamais « javascript: »).
const imageUrl = nullable({ type: "string", maxLength: 2048, pattern: "^(https?://|/(?!/))[^\\s]*$" });
const href = nullable({ type: "string", maxLength: 2048, pattern: "^(https?://|/(?!/)|#)[^\\s]*$" });

// --- Thématiques et régions ---

registerCrud(app, pool, {
  prefix: "/thematiques",
  resource: "thematiques",
  publicRead: true,
  table: {
    name: "thematiques",
    label: "Thématique",
    idPrefix: "th",
    columns: {
      name: "name",
      alias: "alias",
      pictoUrl: "picto_url",
      covid: "covid",
      inMenuPublications: "in_menu_publications",
      inMenuThemes: "in_menu_themes",
      inMenuServices: "in_menu_services",
    },
    orderBy: "name",
  },
  properties: {
    name: text(200),
    alias: { type: "string", maxLength: 200, pattern: "^[a-z0-9]+(-[a-z0-9]+)*$" },
    pictoUrl: imageUrl,
    covid: { type: "boolean" },
    inMenuPublications: { type: "boolean" },
    inMenuThemes: { type: "boolean" },
    inMenuServices: { type: "boolean" },
  },
  required: ["name", "alias"],
});

registerCrud(app, pool, {
  prefix: "/regions",
  resource: "regions",
  publicRead: true,
  table: { name: "regions", label: "Région", idPrefix: "reg", columns: { name: "name", picto: "picto" }, orderBy: "name" },
  properties: { name: text(200), picto: text(255, 0) },
  required: ["name", "picto"],
});

app.get("/sectors", async () => sectors);

// --- Publications ---

const publications: Table = {
  name: "publications",
  label: "Publication",
  idPrefix: "pub",
  columns: {
    title: "title",
    imageUrl: "image_url",
    level: "level",
    regionId: "region_id",
    thematiqueId: "thematique_id",
    excerpt: "excerpt",
    content: "content",
    documents: "documents",
    date: "date",
    latestNipc: "latest_nipc",
    sectors: "sectors",
  },
  json: ["documents"],
  orderBy: "date DESC, title",
};

const publicationProperties = {
  title: text(500),
  imageUrl,
  level: { type: "string", enum: ["national", "regional"] },
  regionId: nullable(text(100)),
  thematiqueId: text(100),
  excerpt: text(2000),
  content: text(200_000),
  documents: {
    type: "array",
    maxItems: 50,
    items: {
      type: "object",
      additionalProperties: false,
      required: ["id", "name", "size"],
      properties: { id: text(100), name: text(255), size: { type: "integer", minimum: 0 } },
    },
  },
  date: { type: "string", format: "date" },
  latestNipc: { type: "boolean" },
  sectors: { type: "array", maxItems: sectors.length, uniqueItems: true, items: { type: "string", enum: sectors.map((s) => s.id) } },
};

type PublicationInput = Partial<Omit<AdminPublication, "id" | "imageUrl" | "regionId">> & {
  imageUrl?: string | null;
  regionId?: string | null;
};

/** Écrit une publication. Le marqueur « la plus récente NIPC » est retiré des autres dans la même transaction. */
function savePublication(input: PublicationInput, id?: string): Promise<AdminPublication> {
  const data: Record<string, unknown> = { ...input };
  if (input.level === "national") data.regionId = null;
  if (input.level === "regional" && !input.regionId && !id) {
    throw new HttpError(400, "VALIDATION_ERROR", "Choisissez la région concernée.");
  }

  return transaction(pool, async (client) => {
    if (input.latestNipc) {
      await client.query("UPDATE publications SET latest_nipc = false WHERE latest_nipc AND id IS DISTINCT FROM $1", [id ?? null]);
    }
    if (!id) return insertRow<AdminPublication>(client, publications, data);
    const saved = await updateRow<AdminPublication>(client, publications, id, data);
    await client.query("UPDATE publications SET updated_at = now() WHERE id = $1", [id]);
    return saved;
  });
}

app.get("/admin/publications", { preHandler: requirePermission("publications", "view") }, () =>
  findAll<AdminPublication>(pool, publications),
);

app.get<{ Params: { id: string } }>(
  "/admin/publications/:id",
  { preHandler: requirePermission("publications", "view"), schema: { params: idParams } },
  (request) => findOne<AdminPublication>(pool, publications, request.params.id),
);

app.post<{ Body: PublicationInput }>(
  "/admin/publications",
  {
    preHandler: requirePermission("publications", "create"),
    schema: {
      body: {
        type: "object",
        additionalProperties: false,
        required: ["title", "level", "thematiqueId", "excerpt", "content", "date"],
        properties: publicationProperties,
      },
    },
  },
  async (request, reply) => reply.code(201).send(await savePublication(request.body)),
);

app.patch<{ Params: { id: string }; Body: PublicationInput }>(
  "/admin/publications/:id",
  {
    preHandler: requirePermission("publications", "update"),
    schema: { params: idParams, body: { type: "object", additionalProperties: false, properties: publicationProperties } },
  },
  (request) => savePublication(request.body, request.params.id),
);

app.delete<{ Params: { id: string } }>(
  "/admin/publications/:id",
  { preHandler: requirePermission("publications", "delete"), schema: { params: idParams } },
  async (request, reply) => {
    const result = await pool.query("DELETE FROM publications WHERE id = $1", [request.params.id]);
    if (result.rowCount === 0) throw notFound(publications.label);
    return reply.code(204).send();
  },
);

// Lecture publique

interface PublicationQuery {
  scope?: "national" | "regional";
  thematiqueId?: string;
  regionId?: string;
  limit?: number;
}

app.get<{ Querystring: PublicationQuery }>(
  "/publications",
  {
    schema: {
      querystring: {
        type: "object",
        properties: {
          scope: { type: "string", enum: ["national", "regional"] },
          thematiqueId: { type: "string", maxLength: 100 },
          regionId: { type: "string", maxLength: 100 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  },
  async (request): Promise<Publication[]> => {
    const { scope, thematiqueId, regionId, limit } = request.query;
    const { rows } = await pool.query(
      `SELECT p.id, p.title, p.date, p.level, p.sectors, t.name AS thematique
       FROM publications p JOIN thematiques t ON t.id = p.thematique_id
       WHERE ($1::text IS NULL OR p.level = $1)
         AND ($2::text IS NULL OR p.thematique_id = $2)
         AND ($3::text IS NULL OR p.region_id = $3)
       ORDER BY p.date DESC, p.title
       LIMIT $4`,
      [scope ?? null, thematiqueId ?? null, regionId ?? null, limit],
    );
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      kind: kindOf(row.level, row.sectors, row.thematique),
      scope: row.level,
      href: `#/publications/${row.id}`,
    }));
  },
);

app.get("/publications/latest-nipc", async () => {
  const rows = await findAll<AdminPublication>(pool, publications, { latestNipc: true });
  if (rows.length === 0) throw notFound("Publication NIPC");
  return rows[0];
});

app.get<{ Params: { id: string } }>("/publications/:id", { schema: { params: idParams } }, (request) =>
  findOne<AdminPublication>(pool, publications, request.params.id),
);

// --- Actualités ---

const news: Table = {
  name: "news",
  label: "Actualité",
  idPrefix: "news",
  columns: { title: "title", date: "date", dateLabel: "date_label", context: "context", href: "href" },
  orderBy: "date DESC NULLS LAST, created_at DESC",
};

/** NewsItem du contrat ; `date` (AAAA-MM-JJ, pour le tri) est un champ en plus. */
const presentNews = (row: Record<string, unknown>): NewsItem & { date?: string } => ({
  ...(row as unknown as NewsItem),
  href: (row.href as string | undefined) ?? `#/actualites/${row.id as string}`,
});

registerCrud(app, pool, {
  prefix: "/news",
  resource: "publications",
  publicRead: true,
  table: news,
  present: presentNews,
  properties: {
    title: text(500),
    date: nullable({ type: "string", format: "date" }),
    dateLabel: nullable(text(200)),
    context: nullable(text(200)),
    href,
  },
  required: ["title"],
});

await start(app, pool);

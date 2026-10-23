import type { FastifyInstance } from "fastify";
import type pg from "pg";
import { compact, type Db } from "./db.ts";
import { notFound, requirePermission } from "./http.ts";
import { newId } from "./ids.ts";
import type { Resource } from "./permissions.ts";

/**
 * Description d'une table exposée en JSON. Les noms de colonnes viennent du code, jamais de la requête :
 * ils peuvent être interpolés dans le SQL ; les valeurs, elles, sont toujours passées en paramètres.
 */
export interface Table {
  name: string;
  /** Libellé pour les messages (« Thématique introuvable. »). */
  label: string;
  idPrefix: string;
  /** Champ JSON (camelCase) → colonne SQL. `id` est implicite. */
  columns: Record<string, string>;
  /** Colonnes jsonb (encodées avec JSON.stringify). */
  json?: string[];
  /** Colonnes écrites mais jamais relues (mot de passe…). */
  writeOnly?: string[];
  orderBy: string;
}

function selectList(table: Table): string {
  const fields = Object.entries(table.columns).filter(([field]) => !table.writeOnly?.includes(field));
  return ['id AS "id"', ...fields.map(([field, column]) => `${column} AS "${field}"`)].join(", ");
}

function writable(table: Table, data: Record<string, unknown>): [column: string, value: unknown][] {
  return Object.entries(data)
    .filter(([field, value]) => field in table.columns && value !== undefined)
    .map(([field, value]) => [
      table.columns[field],
      table.json?.includes(field) && value !== null ? JSON.stringify(value) : value,
    ]);
}

export async function findAll<T>(db: Db, table: Table, where: Record<string, unknown> = {}, limit?: number): Promise<T[]> {
  const conditions = writable(table, where);
  const clause = conditions.length ? `WHERE ${conditions.map(([column], i) => `${column} = $${i + 1}`).join(" AND ")}` : "";
  const result = await db.query(
    `SELECT ${selectList(table)} FROM ${table.name} ${clause} ORDER BY ${table.orderBy} LIMIT $${conditions.length + 1}`,
    [...conditions.map(([, value]) => value), limit ?? null],
  );
  return result.rows.map((row) => compact<T>(row));
}

export async function findOne<T>(db: Db, table: Table, id: string): Promise<T> {
  const result = await db.query(`SELECT ${selectList(table)} FROM ${table.name} WHERE id = $1`, [id]);
  if (result.rowCount === 0) throw notFound(table.label);
  return compact<T>(result.rows[0]);
}

export async function insertRow<T>(db: Db, table: Table, data: Record<string, unknown>, id = newId(table.idPrefix)): Promise<T> {
  const entries: [string, unknown][] = [["id", id], ...writable(table, data)];
  const result = await db.query(
    `INSERT INTO ${table.name} (${entries.map(([column]) => column).join(", ")})
     VALUES (${entries.map((_, i) => `$${i + 1}`).join(", ")})
     RETURNING ${selectList(table)}`,
    entries.map(([, value]) => value),
  );
  return compact<T>(result.rows[0]);
}

/** Mise à jour partielle : seuls les champs présents changent ; `null` efface un champ optionnel. */
export async function updateRow<T>(db: Db, table: Table, id: string, patch: Record<string, unknown>): Promise<T> {
  const entries = writable(table, patch);
  if (entries.length === 0) return findOne<T>(db, table, id);
  const result = await db.query(
    `UPDATE ${table.name} SET ${entries.map(([column], i) => `${column} = $${i + 2}`).join(", ")}
     WHERE id = $1 RETURNING ${selectList(table)}`,
    [id, ...entries.map(([, value]) => value)],
  );
  if (result.rowCount === 0) throw notFound(table.label);
  return compact<T>(result.rows[0]);
}

export async function deleteRow(db: Db, table: Table, id: string): Promise<void> {
  const result = await db.query(`DELETE FROM ${table.name} WHERE id = $1`, [id]);
  if (result.rowCount === 0) throw notFound(table.label);
}

// --- Schémas JSON ---

export type JsonSchema = Record<string, unknown>;

export const idParams: JsonSchema = {
  type: "object",
  properties: { id: { type: "string", minLength: 1, maxLength: 100 } },
  required: ["id"],
};

export const text = (maxLength = 500, minLength = 1): JsonSchema => ({ type: "string", minLength, maxLength });
export const nullable = (schema: JsonSchema): JsonSchema => ({ ...schema, type: [schema.type as string, "null"] });

export interface CrudOptions {
  prefix: string;
  table: Table;
  resource: Resource;
  /** Propriétés acceptées en écriture (POST et PATCH). Les champs inconnus sont ignorés. */
  properties: Record<string, JsonSchema>;
  /** Champs obligatoires à la création. */
  required: string[];
  /** Lecture ouverte au public (contenus du site) ; sinon il faut le droit « view ». */
  publicRead?: boolean;
  /** Filtres d'égalité acceptés en query string sur la liste, ex. `?typeId=…` (`?limit=` est toujours accepté). */
  filters?: string[];
  /** Mise en forme de la réponse, si elle diffère de la ligne brute. */
  present?: (row: Record<string, unknown>) => unknown;
}

/**
 * Routes REST standard d'une ressource :
 * GET prefix, GET prefix/:id, POST prefix (201), PATCH prefix/:id (mise à jour partielle), DELETE prefix/:id (204).
 */
export function registerCrud(app: FastifyInstance, pool: pg.Pool, options: CrudOptions): void {
  const { prefix, table, resource } = options;
  const present = options.present ?? ((row) => row);
  const read = options.publicRead ? {} : { preHandler: requirePermission(resource, "view") };
  const body = { type: "object", additionalProperties: false, properties: options.properties };
  const query = {
    type: "object",
    properties: {
      ...Object.fromEntries((options.filters ?? []).map((field) => [field, { type: "string", maxLength: 100 }])),
      limit: { type: "integer", minimum: 1, maximum: 1000 },
    },
  };

  app.get<{ Querystring: Record<string, string> & { limit?: number } }>(
    prefix,
    { ...read, schema: { querystring: query } },
    async (request) => {
      const { limit, ...where } = request.query;
      const rows = await findAll<Record<string, unknown>>(pool, table, where, limit);
      return rows.map(present);
    },
  );

  app.get<{ Params: { id: string } }>(`${prefix}/:id`, { ...read, schema: { params: idParams } }, async (request) =>
    present(await findOne(pool, table, request.params.id)),
  );

  app.post<{ Body: Record<string, unknown> }>(
    prefix,
    { preHandler: requirePermission(resource, "create"), schema: { body: { ...body, required: options.required } } },
    async (request, reply) => reply.code(201).send(present(await insertRow(pool, table, request.body))),
  );

  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    `${prefix}/:id`,
    { preHandler: requirePermission(resource, "update"), schema: { params: idParams, body: body } },
    async (request) => present(await updateRow(pool, table, request.params.id, request.body)),
  );

  app.delete<{ Params: { id: string } }>(
    `${prefix}/:id`,
    { preHandler: requirePermission(resource, "delete"), schema: { params: idParams } },
    async (request, reply) => {
      await deleteRow(pool, table, request.params.id);
      return reply.code(204).send();
    },
  );
}

import type { Pool } from "pg";
import { ApiException } from "../http/api.exception";
import { newId } from "../utils/ids";
import { compact } from "./compact";
import type { TableDefinition } from "./table";
import type { Db } from "./transaction";

/**
 * Dépôt SQL de base : lecture, création, mise à jour partielle et suppression d'une table décrite
 * par une TableDefinition. Chaque dépôt concret (ThematiquesRepository…) en hérite et ajoute ses requêtes propres.
 * Toutes les méthodes acceptent une connexion (`db`) pour s'exécuter dans une transaction.
 */
export abstract class SqlRepository<T extends { id: string }> {
  protected abstract readonly table: TableDefinition;

  protected constructor(protected readonly pool: Pool) {}

  async findAll(where: object = {}, limit?: number, db: Db = this.pool): Promise<T[]> {
    const conditions = this.toColumns(where);
    const clause = conditions.length
      ? `WHERE ${conditions.map(([column], i) => `${column} = $${i + 1}`).join(" AND ")}`
      : "";
    const result = await db.query(
      `SELECT ${this.selectList()} FROM ${this.table.name} ${clause}
       ORDER BY ${this.table.orderBy} LIMIT $${conditions.length + 1}`,
      [...conditions.map(([, value]) => value), limit ?? null],
    );
    return result.rows.map((row) => compact<T>(row));
  }

  async findById(id: string, db: Db = this.pool): Promise<T | null> {
    const result = await db.query(`SELECT ${this.selectList()} FROM ${this.table.name} WHERE id = $1`, [id]);
    return result.rowCount ? compact<T>(result.rows[0]) : null;
  }

  /** Comme findById, mais 404 si l'élément n'existe pas. */
  async getById(id: string, db: Db = this.pool): Promise<T> {
    const found = await this.findById(id, db);
    if (!found) throw ApiException.notFound(this.table.label);
    return found;
  }

  async insert(data: object, db: Db = this.pool, id = newId(this.table.idPrefix)): Promise<T> {
    const entries: [string, unknown][] = [["id", id], ...this.toColumns(data)];
    const result = await db.query(
      `INSERT INTO ${this.table.name} (${entries.map(([column]) => column).join(", ")})
       VALUES (${entries.map((_, i) => `$${i + 1}`).join(", ")})
       RETURNING ${this.selectList()}`,
      entries.map(([, value]) => value),
    );
    return compact<T>(result.rows[0]);
  }

  /** Mise à jour partielle : seuls les champs présents changent ; `null` efface un champ optionnel. */
  async update(id: string, patch: object, db: Db = this.pool): Promise<T> {
    const entries = this.toColumns(patch);
    if (entries.length === 0) return this.getById(id, db);
    const result = await db.query(
      `UPDATE ${this.table.name} SET ${entries.map(([column], i) => `${column} = $${i + 2}`).join(", ")}
       WHERE id = $1 RETURNING ${this.selectList()}`,
      [id, ...entries.map(([, value]) => value)],
    );
    if (!result.rowCount) throw ApiException.notFound(this.table.label);
    return compact<T>(result.rows[0]);
  }

  async delete(id: string, db: Db = this.pool): Promise<void> {
    const result = await db.query(`DELETE FROM ${this.table.name} WHERE id = $1`, [id]);
    if (!result.rowCount) throw ApiException.notFound(this.table.label);
  }

  protected selectList(alias = ""): string {
    const prefix = alias ? `${alias}.` : "";
    const fields = Object.entries(this.table.columns).filter(([field]) => !this.table.writeOnly?.includes(field));
    return [`${prefix}id AS "id"`, ...fields.map(([field, column]) => `${prefix}${column} AS "${field}"`)].join(", ");
  }

  /** Garde les champs connus de la table (les autres sont ignorés) et encode le jsonb. */
  private toColumns(data: object): [string, unknown][] {
    return Object.entries(data)
      .filter(([field, value]) => field in this.table.columns && value !== undefined)
      .map(([field, value]) => [
        this.table.columns[field]!,
        this.table.json?.includes(field) && value !== null ? JSON.stringify(value) : value,
      ]);
  }
}

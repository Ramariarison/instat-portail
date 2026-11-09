import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type KeyFigure, PG_POOL, SqlRepository, type TableDefinition } from "@app/common";

/** Chiffre clé avec la valeur nationale la plus récente de son indicateur. */
export interface KeyFigureValue {
  id: string;
  label: string;
  value: number;
  decimals: number;
  unit: string;
  year: number;
  month: number | null;
}

@Injectable()
export class KeyFiguresRepository extends SqlRepository<KeyFigure> {
  protected readonly table: TableDefinition = {
    name: "key_figures",
    label: "Chiffre clé",
    idPrefix: "kf",
    columns: { indicatorId: "indicator_id", label: "label", decimals: "decimals", position: "position" },
    orderBy: "position, id",
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }

  /** Chiffres clés de l'accueil, dans l'ordre ; ceux dont l'indicateur n'a pas encore de valeur nationale sont omis. */
  async withLatestValues(): Promise<KeyFigureValue[]> {
    const result = await this.pool.query<KeyFigureValue>(
      `SELECT k.id, coalesce(k.label, i.name) AS label, v.value, k.decimals, v.unit, v.year, v.month
       FROM key_figures k
       JOIN indicator_defs i ON i.id = k.indicator_id
       JOIN LATERAL (
         SELECT v.value, v.unit, v.year, v.month
         FROM figure_values v
         JOIN figure_regions f ON f.id = v.figure_region_id AND f.region_id IS NULL
         WHERE v.indicator_id = k.indicator_id
         ORDER BY v.year DESC, v.month DESC NULLS LAST
         LIMIT 1
       ) v ON true
       ORDER BY k.position, k.id`,
    );
    return result.rows;
  }
}

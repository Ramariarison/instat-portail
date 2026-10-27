import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL, SqlRepository, type TableDefinition } from "@app/common";
import type { KeyFigure } from "./key-figure";

@Injectable()
export class KeyFiguresRepository extends SqlRepository<KeyFigure> {
  protected readonly table: TableDefinition = {
    name: "key_figures",
    label: "Chiffre clé",
    idPrefix: "kf",
    columns: { label: "label", value: "value", decimals: "decimals", unit: "unit", period: "period", position: "position" },
    orderBy: "position, label",
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }
}

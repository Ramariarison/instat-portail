import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type IndicatorDef, PG_POOL, SqlRepository, type TableDefinition } from "@app/common";

@Injectable()
export class IndicatorsRepository extends SqlRepository<IndicatorDef> {
  protected readonly table: TableDefinition = {
    name: "indicator_defs",
    label: "Indicateur",
    idPrefix: "ind",
    columns: { typeId: "type_id", name: "name", picto: "picto" },
    orderBy: "name",
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }
}

import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type FigureValue, PG_POOL, SqlRepository, type TableDefinition } from "@app/common";

@Injectable()
export class FigureValuesRepository extends SqlRepository<FigureValue> {
  protected readonly table: TableDefinition = {
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
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }
}

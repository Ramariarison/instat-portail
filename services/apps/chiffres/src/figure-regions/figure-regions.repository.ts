import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type FigureRegion, PG_POOL, SqlRepository, type TableDefinition } from "@app/common";

@Injectable()
export class FigureRegionsRepository extends SqlRepository<FigureRegion> {
  protected readonly table: TableDefinition = {
    name: "figure_regions",
    label: "Région en chiffres",
    idPrefix: "fr",
    columns: { name: "name", regionId: "region_id" },
    orderBy: "region_id IS NOT NULL, name",
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }
}

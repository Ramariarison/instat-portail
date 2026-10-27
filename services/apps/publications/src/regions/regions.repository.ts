import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL, type Region, SqlRepository, type TableDefinition } from "@app/common";

@Injectable()
export class RegionsRepository extends SqlRepository<Region> {
  protected readonly table: TableDefinition = {
    name: "regions",
    label: "Région",
    idPrefix: "reg",
    columns: { name: "name", picto: "picto" },
    orderBy: "name",
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }
}

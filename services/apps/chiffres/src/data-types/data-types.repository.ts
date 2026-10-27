import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type DataType, PG_POOL, SqlRepository, type TableDefinition } from "@app/common";

@Injectable()
export class DataTypesRepository extends SqlRepository<DataType> {
  protected readonly table: TableDefinition = {
    name: "data_types",
    label: "Type de données",
    idPrefix: "type",
    columns: { name: "name", picto: "picto" },
    orderBy: "name",
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }
}

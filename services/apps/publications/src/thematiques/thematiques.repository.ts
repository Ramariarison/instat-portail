import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL, SqlRepository, type TableDefinition, type Thematique } from "@app/common";

@Injectable()
export class ThematiquesRepository extends SqlRepository<Thematique> {
  protected readonly table: TableDefinition = {
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
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }
}

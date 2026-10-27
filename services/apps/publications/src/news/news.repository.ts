import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL, SqlRepository, type TableDefinition } from "@app/common";
import type { StoredNews } from "./news-item";

@Injectable()
export class NewsRepository extends SqlRepository<StoredNews> {
  protected readonly table: TableDefinition = {
    name: "news",
    label: "Actualité",
    idPrefix: "news",
    columns: { title: "title", date: "date", dateLabel: "date_label", context: "context", href: "href" },
    orderBy: "date DESC NULLS LAST, created_at DESC",
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }
}

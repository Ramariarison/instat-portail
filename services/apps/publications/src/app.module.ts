import path from "node:path";
import { Module } from "@nestjs/common";
import { DatabaseModule, HealthModule, SecurityModule } from "@app/common";
import { NewsModule } from "./news/news.module";
import { PublicationsModule } from "./publications/publications.module";
import { RegionsModule } from "./regions/regions.module";
import { SectorsModule } from "./sectors/sectors.module";
import { SeedModule } from "./seed/seed.module";
import { ThematiquesModule } from "./thematiques/thematiques.module";

@Module({
  imports: [
    DatabaseModule.forRoot({ migrationsDir: process.env.MIGRATIONS_DIR ?? path.resolve("apps/publications/migrations") }),
    SecurityModule,
    HealthModule.forService("publications"),
    ThematiquesModule,
    RegionsModule,
    SectorsModule,
    PublicationsModule,
    NewsModule,
    SeedModule,
  ],
})
export class AppModule {}

import path from "node:path";
import { Module } from "@nestjs/common";
import { DatabaseModule, HealthModule, SecurityModule } from "@app/common";
import { DataTypesModule } from "./data-types/data-types.module";
import { FigureRegionsModule } from "./figure-regions/figure-regions.module";
import { FigureValuesModule } from "./figure-values/figure-values.module";
import { IndicatorsModule } from "./indicators/indicators.module";
import { KeyFiguresModule } from "./key-figures/key-figures.module";
import { SeedModule } from "./seed/seed.module";

@Module({
  imports: [
    DatabaseModule.forRoot({ migrationsDir: process.env.MIGRATIONS_DIR ?? path.resolve("apps/chiffres/migrations") }),
    SecurityModule,
    HealthModule.forService("chiffres"),
    KeyFiguresModule,
    DataTypesModule,
    IndicatorsModule,
    FigureRegionsModule,
    FigureValuesModule,
    SeedModule,
  ],
})
export class AppModule {}

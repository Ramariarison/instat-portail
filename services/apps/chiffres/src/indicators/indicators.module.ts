import { Module } from "@nestjs/common";
import { IndicatorsController } from "./indicators.controller";
import { IndicatorsRepository } from "./indicators.repository";
import { IndicatorsService } from "./indicators.service";

@Module({
  controllers: [IndicatorsController],
  providers: [IndicatorsService, IndicatorsRepository],
})
export class IndicatorsModule {}

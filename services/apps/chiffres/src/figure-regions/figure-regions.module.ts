import { Module } from "@nestjs/common";
import { FigureRegionsController } from "./figure-regions.controller";
import { FigureRegionsRepository } from "./figure-regions.repository";
import { FigureRegionsService } from "./figure-regions.service";

@Module({
  controllers: [FigureRegionsController],
  providers: [FigureRegionsService, FigureRegionsRepository],
})
export class FigureRegionsModule {}

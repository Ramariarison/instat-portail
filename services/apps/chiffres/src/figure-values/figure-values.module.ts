import { Module } from "@nestjs/common";
import { FigureValuesController } from "./figure-values.controller";
import { FigureValuesRepository } from "./figure-values.repository";
import { FigureValuesService } from "./figure-values.service";

@Module({
  controllers: [FigureValuesController],
  providers: [FigureValuesService, FigureValuesRepository],
})
export class FigureValuesModule {}

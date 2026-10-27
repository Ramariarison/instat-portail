import { Module } from "@nestjs/common";
import { DataTypesController } from "./data-types.controller";
import { DataTypesRepository } from "./data-types.repository";
import { DataTypesService } from "./data-types.service";

@Module({
  controllers: [DataTypesController],
  providers: [DataTypesService, DataTypesRepository],
})
export class DataTypesModule {}

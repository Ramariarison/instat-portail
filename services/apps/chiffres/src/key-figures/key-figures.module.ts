import { Module } from "@nestjs/common";
import { KeyFiguresController } from "./key-figures.controller";
import { KeyFiguresRepository } from "./key-figures.repository";
import { KeyFiguresService } from "./key-figures.service";

@Module({
  controllers: [KeyFiguresController],
  providers: [KeyFiguresService, KeyFiguresRepository],
})
export class KeyFiguresModule {}

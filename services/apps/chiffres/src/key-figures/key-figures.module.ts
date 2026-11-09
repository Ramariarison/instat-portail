import { Module } from "@nestjs/common";
import { HomeFiguresController } from "./home-figures.controller";
import { KeyFiguresController } from "./key-figures.controller";
import { KeyFiguresRepository } from "./key-figures.repository";
import { KeyFiguresService } from "./key-figures.service";

@Module({
  controllers: [HomeFiguresController, KeyFiguresController],
  providers: [KeyFiguresService, KeyFiguresRepository],
})
export class KeyFiguresModule {}

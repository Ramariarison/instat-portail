import { Module } from "@nestjs/common";
import { ThematiquesController } from "./thematiques.controller";
import { ThematiquesRepository } from "./thematiques.repository";
import { ThematiquesService } from "./thematiques.service";

@Module({
  controllers: [ThematiquesController],
  providers: [ThematiquesService, ThematiquesRepository],
})
export class ThematiquesModule {}

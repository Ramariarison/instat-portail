import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { type Indicator, Public } from "@app/common";
import { KeyFiguresService } from "./key-figures.service";

/** Chiffres clés de la page d'accueil (contrat Indicator), calculés à partir de la fiche nationale. */
@ApiTags("Chiffres clés (accueil)")
@Controller("indicators")
export class HomeFiguresController {
  constructor(private readonly service: KeyFiguresService) {}

  @Public()
  @Get()
  findAll(): Promise<Indicator[]> {
    return this.service.home();
  }
}

import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { type KeyFigure, Public, RequirePermission } from "@app/common";
import { CreateKeyFigureDto } from "./dto/create-key-figure.dto";
import { UpdateKeyFigureDto } from "./dto/update-key-figure.dto";
import { KeyFiguresService } from "./key-figures.service";

/**
 * Choix des chiffres clés de l'accueil (indicateur, libellé, décimales, ordre).
 * Lecture publique ; écriture avec le droit « indicateurs » (administrateurs).
 */
@ApiTags("Chiffres clés (accueil)")
@Controller("chiffres/key-figures")
export class KeyFiguresController {
  constructor(private readonly service: KeyFiguresService) {}

  @Public()
  @Get()
  findAll(): Promise<KeyFigure[]> {
    return this.service.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<KeyFigure> {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @RequirePermission("indicateurs", "create")
  create(@Body() dto: CreateKeyFigureDto): Promise<KeyFigure> {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @RequirePermission("indicateurs", "update")
  update(@Param("id") id: string, @Body() dto: UpdateKeyFigureDto): Promise<KeyFigure> {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(204)
  @RequirePermission("indicateurs", "delete")
  remove(@Param("id") id: string): Promise<void> {
    return this.service.remove(id);
  }
}

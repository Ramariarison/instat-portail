import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public, RequirePermission } from "@app/common";
import { CreateKeyFigureDto } from "./dto/create-key-figure.dto";
import { UpdateKeyFigureDto } from "./dto/update-key-figure.dto";
import type { KeyFigure } from "./key-figure";
import { KeyFiguresService } from "./key-figures.service";

/** Chiffres clés de la page d'accueil (contrat Indicator). Lecture publique ; écriture avec le droit « figures ». */
@ApiTags("Chiffres clés (accueil)")
@Controller("indicators")
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
  @RequirePermission("figures", "create")
  create(@Body() dto: CreateKeyFigureDto): Promise<KeyFigure> {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @RequirePermission("figures", "update")
  update(@Param("id") id: string, @Body() dto: UpdateKeyFigureDto): Promise<KeyFigure> {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(204)
  @RequirePermission("figures", "delete")
  remove(@Param("id") id: string): Promise<void> {
    return this.service.remove(id);
  }
}

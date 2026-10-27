import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { type FigureRegion, Public, RequirePermission } from "@app/common";
import { CreateFigureRegionDto } from "./dto/create-figure-region.dto";
import { UpdateFigureRegionDto } from "./dto/update-figure-region.dto";
import { FigureRegionsService } from "./figure-regions.service";

/** Fiches « région en chiffres » (Madagascar en tête) ; supprimer une fiche supprime ses valeurs. Lecture publique ; écriture avec le droit « figures ». */
@ApiTags("Régions en chiffres")
@Controller("chiffres/regions")
export class FigureRegionsController {
  constructor(private readonly service: FigureRegionsService) {}

  @Public()
  @Get()
  findAll(): Promise<FigureRegion[]> {
    return this.service.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<FigureRegion> {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @RequirePermission("figures", "create")
  create(@Body() dto: CreateFigureRegionDto): Promise<FigureRegion> {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @RequirePermission("figures", "update")
  update(@Param("id") id: string, @Body() dto: UpdateFigureRegionDto): Promise<FigureRegion> {
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

import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { type IndicatorDef, Public, RequirePermission } from "@app/common";
import { CreateIndicatorDefDto } from "./dto/create-indicator.dto";
import { ListIndicatorsQuery } from "./dto/list-indicators.query";
import { UpdateIndicatorDefDto } from "./dto/update-indicator.dto";
import { IndicatorsService } from "./indicators.service";

/** Indicateurs, rattachés à un type de données ; suppression refusée s'ils ont des valeurs. Lecture publique ; écriture avec le droit « indicateurs ». */
@ApiTags("Indicateurs")
@Controller("chiffres/indicators")
export class IndicatorsController {
  constructor(private readonly service: IndicatorsService) {}

  @Public()
  @Get()
  findAll(@Query() query: ListIndicatorsQuery): Promise<IndicatorDef[]> {
    return this.service.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<IndicatorDef> {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @RequirePermission("indicateurs", "create")
  create(@Body() dto: CreateIndicatorDefDto): Promise<IndicatorDef> {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @RequirePermission("indicateurs", "update")
  update(@Param("id") id: string, @Body() dto: UpdateIndicatorDefDto): Promise<IndicatorDef> {
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

import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { type FigureValue, Public, RequirePermission } from "@app/common";
import { CreateFigureValueDto } from "./dto/create-figure-value.dto";
import { ListFigureValuesQuery } from "./dto/list-figure-values.query";
import { UpdateFigureValueDto } from "./dto/update-figure-value.dto";
import { FigureValuesService } from "./figure-values.service";

/** Valeurs : une par (région, indicateur, année), sinon 409 ALREADY_EXISTS. Lecture publique ; écriture avec le droit « figures ». */
@ApiTags("Valeurs par région")
@Controller("chiffres/values")
export class FigureValuesController {
  constructor(private readonly service: FigureValuesService) {}

  @Public()
  @Get()
  findAll(@Query() query: ListFigureValuesQuery): Promise<FigureValue[]> {
    return this.service.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<FigureValue> {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @RequirePermission("figures", "create")
  create(@Body() dto: CreateFigureValueDto): Promise<FigureValue> {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @RequirePermission("figures", "update")
  update(@Param("id") id: string, @Body() dto: UpdateFigureValueDto): Promise<FigureValue> {
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

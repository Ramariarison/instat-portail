import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { type DataType, Public, RequirePermission } from "@app/common";
import { CreateDataTypeDto } from "./dto/create-data-type.dto";
import { UpdateDataTypeDto } from "./dto/update-data-type.dto";
import { DataTypesService } from "./data-types.service";

/** Types de données : premier niveau de classement des indicateurs. Lecture publique ; écriture avec le droit « types ». */
@ApiTags("Types de données")
@Controller("chiffres/types")
export class DataTypesController {
  constructor(private readonly service: DataTypesService) {}

  @Public()
  @Get()
  findAll(): Promise<DataType[]> {
    return this.service.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<DataType> {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @RequirePermission("types", "create")
  create(@Body() dto: CreateDataTypeDto): Promise<DataType> {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @RequirePermission("types", "update")
  update(@Param("id") id: string, @Body() dto: UpdateDataTypeDto): Promise<DataType> {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(204)
  @RequirePermission("types", "delete")
  remove(@Param("id") id: string): Promise<void> {
    return this.service.remove(id);
  }
}

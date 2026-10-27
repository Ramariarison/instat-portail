import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public, type Region, RequirePermission } from "@app/common";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import { RegionsService } from "./regions.service";

@ApiTags("Régions")
@Controller("regions")
export class RegionsController {
  constructor(private readonly regions: RegionsService) {}

  @Public()
  @Get()
  findAll(): Promise<Region[]> {
    return this.regions.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<Region> {
    return this.regions.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @RequirePermission("regions", "create")
  create(@Body() dto: CreateRegionDto): Promise<Region> {
    return this.regions.create(dto);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @RequirePermission("regions", "update")
  update(@Param("id") id: string, @Body() dto: UpdateRegionDto): Promise<Region> {
    return this.regions.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(204)
  @RequirePermission("regions", "delete")
  remove(@Param("id") id: string): Promise<void> {
    return this.regions.remove(id);
  }
}

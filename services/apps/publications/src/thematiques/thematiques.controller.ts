import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public, RequirePermission, type Thematique } from "@app/common";
import { CreateThematiqueDto } from "./dto/create-thematique.dto";
import { UpdateThematiqueDto } from "./dto/update-thematique.dto";
import { ThematiquesService } from "./thematiques.service";

@ApiTags("Thématiques")
@Controller("thematiques")
export class ThematiquesController {
  constructor(private readonly thematiques: ThematiquesService) {}

  @Public()
  @Get()
  findAll(): Promise<Thematique[]> {
    return this.thematiques.findAll();
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<Thematique> {
    return this.thematiques.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @RequirePermission("thematiques", "create")
  create(@Body() dto: CreateThematiqueDto): Promise<Thematique> {
    return this.thematiques.create(dto);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @RequirePermission("thematiques", "update")
  update(@Param("id") id: string, @Body() dto: UpdateThematiqueDto): Promise<Thematique> {
    return this.thematiques.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(204)
  @RequirePermission("thematiques", "delete")
  remove(@Param("id") id: string): Promise<void> {
    return this.thematiques.remove(id);
  }
}

import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { type AdminPublication, RequirePermission } from "@app/common";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { UpdatePublicationDto } from "./dto/update-publication.dto";
import { PublicationsService } from "./publications.service";

/** Gestion des publications dans le back-office (ressource « publications » de la matrice RBAC). */
@ApiTags("Publications (back-office)")
@ApiBearerAuth()
@Controller("admin/publications")
export class AdminPublicationsController {
  constructor(private readonly publications: PublicationsService) {}

  @Get()
  @RequirePermission("publications", "view")
  findAll(): Promise<AdminPublication[]> {
    return this.publications.findAll();
  }

  @Get(":id")
  @RequirePermission("publications", "view")
  findOne(@Param("id") id: string): Promise<AdminPublication> {
    return this.publications.findOne(id);
  }

  @Post()
  @RequirePermission("publications", "create")
  create(@Body() dto: CreatePublicationDto): Promise<AdminPublication> {
    return this.publications.create(dto);
  }

  @Patch(":id")
  @RequirePermission("publications", "update")
  update(@Param("id") id: string, @Body() dto: UpdatePublicationDto): Promise<AdminPublication> {
    return this.publications.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  @RequirePermission("publications", "delete")
  remove(@Param("id") id: string): Promise<void> {
    return this.publications.remove(id);
  }
}

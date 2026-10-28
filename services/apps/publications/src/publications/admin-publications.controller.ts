import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { type AdminPublication, CurrentUser, type PublicationReview, RequirePermission, type TokenPayload } from "@app/common";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { ReturnPublicationDto } from "./dto/return-publication.dto";
import { UpdatePublicationDto } from "./dto/update-publication.dto";
import { PublicationsService } from "./publications.service";
import { PublicationWorkflowService } from "./workflow/publication-workflow.service";

/**
 * Publications dans le back-office (ressource « publications » de la matrice RBAC), avec le workflow de validation :
 * l'éditeur crée un brouillon, le modifie puis le soumet ; l'administrateur le publie ou le renvoie avec un commentaire.
 */
@ApiTags("Publications (back-office)")
@ApiBearerAuth()
@Controller("admin/publications")
export class AdminPublicationsController {
  constructor(
    private readonly publications: PublicationsService,
    private readonly workflow: PublicationWorkflowService,
  ) {}

  /** Toutes les publications, quel que soit leur statut. */
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

  /** Historique : soumissions, renvois (avec commentaire), mise en ligne. */
  @Get(":id/reviews")
  @RequirePermission("publications", "view")
  history(@Param("id") id: string): Promise<PublicationReview[]> {
    return this.workflow.history(id);
  }

  /** Crée un brouillon, dont la personne connectée est l'auteur. */
  @Post()
  @RequirePermission("publications", "create")
  create(@Body() dto: CreatePublicationDto, @CurrentUser() actor: TokenPayload): Promise<AdminPublication> {
    return this.publications.create(dto, actor);
  }

  /** L'éditeur ne modifie que ses brouillons et ses publications renvoyées ; l'administrateur, tout. */
  @Patch(":id")
  @RequirePermission("publications", "update")
  update(
    @Param("id") id: string,
    @Body() dto: UpdatePublicationDto,
    @CurrentUser() actor: TokenPayload,
  ): Promise<AdminPublication> {
    return this.publications.update(id, dto, actor);
  }

  @Post(":id/submit")
  @HttpCode(200)
  @RequirePermission("publications", "update")
  submit(@Param("id") id: string, @CurrentUser() actor: TokenPayload): Promise<AdminPublication> {
    return this.workflow.submit(id, actor);
  }

  @Post(":id/publish")
  @HttpCode(200)
  @RequirePermission("publications", "validate")
  publish(@Param("id") id: string, @CurrentUser() actor: TokenPayload): Promise<AdminPublication> {
    return this.workflow.publish(id, actor);
  }

  @Post(":id/return")
  @HttpCode(200)
  @RequirePermission("publications", "validate")
  sendBack(
    @Param("id") id: string,
    @Body() dto: ReturnPublicationDto,
    @CurrentUser() actor: TokenPayload,
  ): Promise<AdminPublication> {
    return this.workflow.sendBack(id, dto.comment, actor);
  }

  @Delete(":id")
  @HttpCode(204)
  @RequirePermission("publications", "delete")
  remove(@Param("id") id: string): Promise<void> {
    return this.publications.remove(id);
  }
}

import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type AdminPublication, ApiException, PG_POOL, runInTransaction, type TokenPayload } from "@app/common";
import type { CreatePublicationDto } from "./dto/create-publication.dto";
import type { ListPublicationsQuery } from "./dto/list-publications.query";
import type { UpdatePublicationDto } from "./dto/update-publication.dto";
import { kindOf } from "./publication-kind";
import type { PublicationPage } from "./publication-page";
import { PublicationsRepository } from "./publications.repository";
import { canEdit } from "./workflow/publication-workflow";

/** Ce que le site public voit d'une publication : ni l'auteur, ni le statut, ni les commentaires internes. */
type PublicPublication = Omit<AdminPublication, "createdBy" | "createdByName" | "returnComment">;

@Injectable()
export class PublicationsService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly publications: PublicationsRepository,
  ) {}

  // --- Site public : publications en ligne seulement ---

  async search(query: ListPublicationsQuery): Promise<PublicationPage> {
    const { rows, total } = await this.publications.search(query);
    return {
      total,
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        kind: kindOf(row.level, row.sectors, row.thematique),
        scope: row.level,
        href: `#/publications/${row.id}`,
      })),
    };
  }

  async findPublished(id: string): Promise<PublicPublication> {
    const publication = await this.publications.findById(id);
    if (publication?.status !== "published") throw ApiException.notFound("Publication");
    return this.toPublic(publication);
  }

  async latestNipc(): Promise<PublicPublication> {
    const [latest] = await this.publications.findAll({ latestNipc: true, status: "published" }, 1);
    if (!latest) throw ApiException.notFound("Publication NIPC");
    return this.toPublic(latest);
  }

  // --- Back-office : tous les statuts (un éditeur voit tout, mais ne modifie que ses publications) ---

  findAll(): Promise<AdminPublication[]> {
    return this.publications.findAll();
  }

  findOne(id: string): Promise<AdminPublication> {
    return this.publications.getById(id);
  }

  /** Toute nouvelle publication est un brouillon de la personne qui la crée (hors ligne, le marqueur NIPC n'enlève rien). */
  create(dto: CreatePublicationDto, actor: TokenPayload): Promise<AdminPublication> {
    return this.publications.insert({ ...this.normalize(dto), status: "draft", createdBy: actor.sub, createdByName: actor.name });
  }

  /** Modification du contenu, selon les règles du workflow (auteur et statut). */
  update(id: string, dto: UpdatePublicationDto, actor: TokenPayload): Promise<AdminPublication> {
    return runInTransaction(this.pool, async (client) => {
      const state = await this.publications.lockWorkflowState(id, client);
      if (!state) throw ApiException.notFound("Publication");
      const decision = canEdit({ ...state, actor: { id: actor.sub, role: actor.role } });
      if (!decision.allowed) throw ApiException.fromDecision(decision);

      // Une publication en ligne qui prend le marqueur NIPC le retire aux autres.
      if (dto.latestNipc && state.status === "published") await this.publications.clearLatestNipc(id, client);
      const saved = await this.publications.update(id, this.normalize(dto, id), client);
      await this.publications.touch(id, client);
      return saved;
    });
  }

  remove(id: string): Promise<void> {
    return this.publications.delete(id);
  }

  /** Une publication nationale n'a pas de région ; une régionale en exige une (à la création). */
  private normalize(dto: UpdatePublicationDto, id?: string): UpdatePublicationDto {
    const data: UpdatePublicationDto = { ...dto };
    if (dto.level === "national") data.regionId = null;
    if (dto.level === "regional" && !dto.regionId && !id) throw ApiException.badRequest("Choisissez la région concernée.");
    return data;
  }

  private toPublic(publication: AdminPublication): PublicPublication {
    const { createdBy: _createdBy, createdByName: _createdByName, returnComment: _returnComment, ...visible } = publication;
    return visible;
  }
}

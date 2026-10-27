import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type AdminPublication, ApiException, PG_POOL, runInTransaction } from "@app/common";
import type { CreatePublicationDto } from "./dto/create-publication.dto";
import type { ListPublicationsQuery } from "./dto/list-publications.query";
import type { UpdatePublicationDto } from "./dto/update-publication.dto";
import { kindOf } from "./publication-kind";
import type { PublicationPage } from "./publication-page";
import { PublicationsRepository } from "./publications.repository";

@Injectable()
export class PublicationsService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly publications: PublicationsRepository,
  ) {}

  // --- Site public ---

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

  async latestNipc(): Promise<AdminPublication> {
    const [latest] = await this.publications.findAll({ latestNipc: true }, 1);
    if (!latest) throw ApiException.notFound("Publication NIPC");
    return latest;
  }

  // --- Back-office ---

  findAll(): Promise<AdminPublication[]> {
    return this.publications.findAll();
  }

  findOne(id: string): Promise<AdminPublication> {
    return this.publications.getById(id);
  }

  create(dto: CreatePublicationDto): Promise<AdminPublication> {
    return this.save(dto);
  }

  update(id: string, dto: UpdatePublicationDto): Promise<AdminPublication> {
    return this.save(dto, id);
  }

  remove(id: string): Promise<void> {
    return this.publications.delete(id);
  }

  /**
   * Écrit une publication. Une publication nationale n'a pas de région ; une régionale en exige une.
   * Le marqueur « la plus récente NIPC » est retiré des autres dans la même transaction.
   */
  private save(dto: UpdatePublicationDto, id?: string): Promise<AdminPublication> {
    const data: UpdatePublicationDto = { ...dto };
    if (dto.level === "national") data.regionId = null;
    if (dto.level === "regional" && !dto.regionId && !id) throw ApiException.badRequest("Choisissez la région concernée.");

    return runInTransaction(this.pool, async (client) => {
      if (dto.latestNipc) await this.publications.clearLatestNipc(id ?? null, client);
      if (!id) return this.publications.insert(data, client);
      const saved = await this.publications.update(id, data, client);
      await this.publications.touch(id, client);
      return saved;
    });
  }
}

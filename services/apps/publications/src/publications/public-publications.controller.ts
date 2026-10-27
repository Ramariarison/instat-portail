import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { FastifyReply } from "fastify";
import { type AdminPublication, Public, type Publication } from "@app/common";
import { ListPublicationsQuery } from "./dto/list-publications.query";
import { PublicationsService } from "./publications.service";

/** Lecture publique (site) : liste filtrée, fiche, dernière publication NIPC. */
@ApiTags("Publications (site public)")
@Public()
@Controller("publications")
export class PublicPublicationsController {
  constructor(private readonly publications: PublicationsService) {}

  /** Liste filtrée ; le nombre total de résultats est dans l'en-tête X-Total-Count. */
  @Get()
  async search(
    @Query() query: ListPublicationsQuery,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<Publication[]> {
    const page = await this.publications.search(query);
    void reply.header("X-Total-Count", page.total);
    return page.items;
  }

  @Get("latest-nipc")
  latestNipc(): Promise<AdminPublication> {
    return this.publications.latestNipc();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<AdminPublication> {
    return this.publications.findOne(id);
  }
}

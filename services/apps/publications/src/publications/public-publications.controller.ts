import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { FastifyReply } from "fastify";
import { Public, type Publication } from "@app/common";
import { ListPublicationsQuery } from "./dto/list-publications.query";
import { PublicationsService } from "./publications.service";

/** Lecture publique (site) : publications en ligne seulement — liste filtrée, fiche, dernière publication NIPC. */
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
  latestNipc(): ReturnType<PublicationsService["latestNipc"]> {
    return this.publications.latestNipc();
  }

  /** Fiche d'une publication en ligne (404 si elle n'est pas publiée). */
  @Get(":id")
  findOne(@Param("id") id: string): ReturnType<PublicationsService["findPublished"]> {
    return this.publications.findPublished(id);
  }
}

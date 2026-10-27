import { Controller, Delete, Get, HttpCode, Param, Post, Req, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ApiException, CurrentUser, Public, RequirePermission, type TokenPayload } from "@app/common";
import { INLINE_TYPES } from "./allowed-types";
import { FilesService } from "./files.service";
import type { FileInfo } from "./stored-file";

/**
 * Images (pictos, image de titre) et documents des publications.
 * Envoi : tout utilisateur connecté. Lecture : publique (les documents publiés le sont). Suppression : droit « publications / delete ».
 */
@ApiTags("Fichiers")
@Controller("files")
export class FilesController {
  constructor(private readonly files: FilesService) {}

  /** Envoi multipart d'UN fichier, dans le champ « file ». */
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @Post()
  async upload(@Req() request: FastifyRequest, @CurrentUser() user: TokenPayload): Promise<FileInfo> {
    const upload = await request.file();
    if (!upload) throw ApiException.badRequest("Aucun fichier reçu (champ « file »).", "NO_FILE");
    return this.files.store(upload, user.sub);
  }

  @Public()
  @Get(":id/meta")
  info(@Param("id") id: string): Promise<FileInfo> {
    return this.files.info(id);
  }

  @Public()
  @Get(":id")
  async download(@Param("id") id: string, @Res() reply: FastifyReply): Promise<void> {
    const { file, stream } = await this.files.open(id);
    const disposition = INLINE_TYPES.has(file.type) ? "inline" : "attachment";
    await reply
      .header("Content-Type", file.type)
      .header("Content-Length", file.size)
      .header("Content-Disposition", `${disposition}; filename*=UTF-8''${encodeURIComponent(file.name)}`)
      .header("X-Content-Type-Options", "nosniff")
      .header("Cache-Control", "public, max-age=31536000, immutable")
      .send(stream);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(204)
  @RequirePermission("publications", "delete")
  remove(@Param("id") id: string): Promise<void> {
    return this.files.remove(id);
  }
}

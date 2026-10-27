import { Module } from "@nestjs/common";
import { AdminPublicationsController } from "./admin-publications.controller";
import { PublicationsRepository } from "./publications.repository";
import { PublicationsService } from "./publications.service";
import { PublicPublicationsController } from "./public-publications.controller";

@Module({
  controllers: [PublicPublicationsController, AdminPublicationsController],
  providers: [PublicationsService, PublicationsRepository],
})
export class PublicationsModule {}

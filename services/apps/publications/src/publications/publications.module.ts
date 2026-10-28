import { Module } from "@nestjs/common";
import { AdminPublicationsController } from "./admin-publications.controller";
import { PublicationsRepository } from "./publications.repository";
import { PublicationsService } from "./publications.service";
import { PublicPublicationsController } from "./public-publications.controller";
import { PublicationReviewsRepository } from "./reviews/publication-reviews.repository";
import { PublicationWorkflowService } from "./workflow/publication-workflow.service";

@Module({
  controllers: [PublicPublicationsController, AdminPublicationsController],
  providers: [PublicationsService, PublicationWorkflowService, PublicationsRepository, PublicationReviewsRepository],
})
export class PublicationsModule {}

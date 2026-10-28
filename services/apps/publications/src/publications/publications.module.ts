import { Module } from "@nestjs/common";
import { AdminPublicationsController } from "./admin-publications.controller";
import { PublicationsRepository } from "./publications.repository";
import { PublicationsService } from "./publications.service";
import { PublicPublicationsController } from "./public-publications.controller";
import { PublicationReviewsRepository } from "./reviews/publication-reviews.repository";
import { PublicationStatsRepository } from "./stats/publication-stats.repository";
import { PublicationStatsService } from "./stats/publication-stats.service";
import { PublicationWorkflowService } from "./workflow/publication-workflow.service";

@Module({
  controllers: [PublicPublicationsController, AdminPublicationsController],
  providers: [
    PublicationsService,
    PublicationWorkflowService,
    PublicationStatsService,
    PublicationsRepository,
    PublicationReviewsRepository,
    PublicationStatsRepository,
  ],
})
export class PublicationsModule {}

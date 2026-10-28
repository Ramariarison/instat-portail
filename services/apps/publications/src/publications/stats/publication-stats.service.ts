import { Injectable } from "@nestjs/common";
import type { PublicationStats } from "@app/common";
import { PublicationStatsRepository } from "./publication-stats.repository";

/** Chiffres du tableau de bord : une seule requête HTTP, des agrégats calculés par PostgreSQL. */
@Injectable()
export class PublicationStatsService {
  constructor(private readonly stats: PublicationStatsRepository) {}

  async overview(): Promise<PublicationStats> {
    const [byStatus, publishedByLevel, publishedLast30Days, byThematique, recentActivity] = await Promise.all([
      this.stats.countByStatus(),
      this.stats.publishedByLevel(),
      this.stats.publishedSince(30),
      this.stats.publishedByThematique(),
      this.stats.recentActivity(),
    ]);
    return { byStatus, publishedByLevel, publishedLast30Days, byThematique, recentActivity };
  }
}

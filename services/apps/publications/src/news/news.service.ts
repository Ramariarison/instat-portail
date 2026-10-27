import { Injectable } from "@nestjs/common";
import type { NewsItem } from "@app/common";
import type { CreateNewsDto } from "./dto/create-news.dto";
import type { UpdateNewsDto } from "./dto/update-news.dto";
import { toNewsItem } from "./news-item";
import { NewsRepository } from "./news.repository";

/** Fil d'actualités de la page d'accueil, les plus récentes d'abord. */
@Injectable()
export class NewsService {
  constructor(private readonly news: NewsRepository) {}

  async findAll(limit?: number): Promise<NewsItem[]> {
    return (await this.news.findAll({}, limit)).map(toNewsItem);
  }

  async findOne(id: string): Promise<NewsItem> {
    return toNewsItem(await this.news.getById(id));
  }

  async create(dto: CreateNewsDto): Promise<NewsItem> {
    return toNewsItem(await this.news.insert(dto));
  }

  async update(id: string, dto: UpdateNewsDto): Promise<NewsItem> {
    return toNewsItem(await this.news.update(id, dto));
  }

  remove(id: string): Promise<void> {
    return this.news.delete(id);
  }
}

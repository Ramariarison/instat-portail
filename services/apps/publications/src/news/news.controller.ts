import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { type NewsItem, Public, RequirePermission } from "@app/common";
import { CreateNewsDto } from "./dto/create-news.dto";
import { ListNewsQuery } from "./dto/list-news.query";
import { UpdateNewsDto } from "./dto/update-news.dto";
import { NewsService } from "./news.service";

/** Actualités : lecture publique ; écriture avec le droit « publications ». */
@ApiTags("Actualités")
@Controller("news")
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Public()
  @Get()
  findAll(@Query() query: ListNewsQuery): Promise<NewsItem[]> {
    return this.news.findAll(query.limit);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id") id: string): Promise<NewsItem> {
    return this.news.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @RequirePermission("publications", "create")
  create(@Body() dto: CreateNewsDto): Promise<NewsItem> {
    return this.news.create(dto);
  }

  @ApiBearerAuth()
  @Patch(":id")
  @RequirePermission("publications", "update")
  update(@Param("id") id: string, @Body() dto: UpdateNewsDto): Promise<NewsItem> {
    return this.news.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(204)
  @RequirePermission("publications", "delete")
  remove(@Param("id") id: string): Promise<void> {
    return this.news.remove(id);
  }
}

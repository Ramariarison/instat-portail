import { Injectable } from "@nestjs/common";
import type { FigureRegion } from "@app/common";
import type { CreateFigureRegionDto } from "./dto/create-figure-region.dto";
import type { UpdateFigureRegionDto } from "./dto/update-figure-region.dto";
import { FigureRegionsRepository } from "./figure-regions.repository";

/** Fiches « région en chiffres » (Madagascar en tête) ; supprimer une fiche supprime ses valeurs. */
@Injectable()
export class FigureRegionsService {
  constructor(private readonly repository: FigureRegionsRepository) {}

  findAll(): Promise<FigureRegion[]> {
    return this.repository.findAll();
  }

  findOne(id: string): Promise<FigureRegion> {
    return this.repository.getById(id);
  }

  create(dto: CreateFigureRegionDto): Promise<FigureRegion> {
    return this.repository.insert(dto);
  }

  update(id: string, dto: UpdateFigureRegionDto): Promise<FigureRegion> {
    return this.repository.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

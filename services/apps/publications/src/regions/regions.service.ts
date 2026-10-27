import { Injectable } from "@nestjs/common";
import type { Region } from "@app/common";
import type { CreateRegionDto } from "./dto/create-region.dto";
import type { UpdateRegionDto } from "./dto/update-region.dto";
import { RegionsRepository } from "./regions.repository";

/** Régions administratives, auxquelles se rattachent les publications régionales. */
@Injectable()
export class RegionsService {
  constructor(private readonly regions: RegionsRepository) {}

  findAll(): Promise<Region[]> {
    return this.regions.findAll();
  }

  findOne(id: string): Promise<Region> {
    return this.regions.getById(id);
  }

  create(dto: CreateRegionDto): Promise<Region> {
    return this.regions.insert(dto);
  }

  update(id: string, dto: UpdateRegionDto): Promise<Region> {
    return this.regions.update(id, dto);
  }

  /** Refusée (409 IN_USE) si des publications régionales y sont rattachées. */
  remove(id: string): Promise<void> {
    return this.regions.delete(id);
  }
}

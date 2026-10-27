import { Injectable } from "@nestjs/common";
import type { IndicatorDef } from "@app/common";
import type { CreateIndicatorDefDto } from "./dto/create-indicator.dto";
import type { ListIndicatorsQuery } from "./dto/list-indicators.query";
import type { UpdateIndicatorDefDto } from "./dto/update-indicator.dto";
import { IndicatorsRepository } from "./indicators.repository";

/** Indicateurs, rattachés à un type de données ; suppression refusée s'ils ont des valeurs. */
@Injectable()
export class IndicatorsService {
  constructor(private readonly repository: IndicatorsRepository) {}

  findAll(filters: ListIndicatorsQuery = {}): Promise<IndicatorDef[]> {
    return this.repository.findAll(filters);
  }

  findOne(id: string): Promise<IndicatorDef> {
    return this.repository.getById(id);
  }

  create(dto: CreateIndicatorDefDto): Promise<IndicatorDef> {
    return this.repository.insert(dto);
  }

  update(id: string, dto: UpdateIndicatorDefDto): Promise<IndicatorDef> {
    return this.repository.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

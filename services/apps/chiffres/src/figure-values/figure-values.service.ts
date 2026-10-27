import { Injectable } from "@nestjs/common";
import type { FigureValue } from "@app/common";
import type { CreateFigureValueDto } from "./dto/create-figure-value.dto";
import type { ListFigureValuesQuery } from "./dto/list-figure-values.query";
import type { UpdateFigureValueDto } from "./dto/update-figure-value.dto";
import { FigureValuesRepository } from "./figure-values.repository";

/** Valeurs : une par (région, indicateur, année), sinon 409 ALREADY_EXISTS. */
@Injectable()
export class FigureValuesService {
  constructor(private readonly repository: FigureValuesRepository) {}

  findAll(filters: ListFigureValuesQuery = {}): Promise<FigureValue[]> {
    return this.repository.findAll(filters);
  }

  findOne(id: string): Promise<FigureValue> {
    return this.repository.getById(id);
  }

  create(dto: CreateFigureValueDto): Promise<FigureValue> {
    return this.repository.insert(dto);
  }

  update(id: string, dto: UpdateFigureValueDto): Promise<FigureValue> {
    return this.repository.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

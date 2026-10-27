import { Injectable } from "@nestjs/common";
import type { DataType } from "@app/common";
import type { CreateDataTypeDto } from "./dto/create-data-type.dto";
import type { UpdateDataTypeDto } from "./dto/update-data-type.dto";
import { DataTypesRepository } from "./data-types.repository";

/** Types de données : premier niveau de classement des indicateurs. */
@Injectable()
export class DataTypesService {
  constructor(private readonly repository: DataTypesRepository) {}

  findAll(): Promise<DataType[]> {
    return this.repository.findAll();
  }

  findOne(id: string): Promise<DataType> {
    return this.repository.getById(id);
  }

  create(dto: CreateDataTypeDto): Promise<DataType> {
    return this.repository.insert(dto);
  }

  update(id: string, dto: UpdateDataTypeDto): Promise<DataType> {
    return this.repository.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

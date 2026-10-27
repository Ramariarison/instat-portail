import { Injectable } from "@nestjs/common";
import type { KeyFigure } from "./key-figure";
import type { CreateKeyFigureDto } from "./dto/create-key-figure.dto";
import type { UpdateKeyFigureDto } from "./dto/update-key-figure.dto";
import { KeyFiguresRepository } from "./key-figures.repository";

/** Chiffres clés de la page d'accueil (contrat Indicator). */
@Injectable()
export class KeyFiguresService {
  constructor(private readonly repository: KeyFiguresRepository) {}

  findAll(): Promise<KeyFigure[]> {
    return this.repository.findAll();
  }

  findOne(id: string): Promise<KeyFigure> {
    return this.repository.getById(id);
  }

  create(dto: CreateKeyFigureDto): Promise<KeyFigure> {
    return this.repository.insert(dto);
  }

  update(id: string, dto: UpdateKeyFigureDto): Promise<KeyFigure> {
    return this.repository.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

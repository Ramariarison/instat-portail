import { Injectable } from "@nestjs/common";
import type { Thematique } from "@app/common";
import type { CreateThematiqueDto } from "./dto/create-thematique.dto";
import type { UpdateThematiqueDto } from "./dto/update-thematique.dto";
import { ThematiquesRepository } from "./thematiques.repository";

/** Thématiques : classement principal des publications (une par publication) et entrées de menu. */
@Injectable()
export class ThematiquesService {
  constructor(private readonly thematiques: ThematiquesRepository) {}

  findAll(): Promise<Thematique[]> {
    return this.thematiques.findAll();
  }

  findOne(id: string): Promise<Thematique> {
    return this.thematiques.getById(id);
  }

  create(dto: CreateThematiqueDto): Promise<Thematique> {
    return this.thematiques.insert(dto);
  }

  update(id: string, dto: UpdateThematiqueDto): Promise<Thematique> {
    return this.thematiques.update(id, dto);
  }

  /** Refusée (409 IN_USE) si des publications y sont encore classées : clé étrangère en base. */
  remove(id: string): Promise<void> {
    return this.thematiques.delete(id);
  }
}

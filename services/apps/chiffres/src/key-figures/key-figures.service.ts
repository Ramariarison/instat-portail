import { Injectable } from "@nestjs/common";
import type { Indicator, KeyFigure } from "@app/common";
import type { CreateKeyFigureDto } from "./dto/create-key-figure.dto";
import type { UpdateKeyFigureDto } from "./dto/update-key-figure.dto";
import { KeyFiguresRepository } from "./key-figures.repository";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** « mars 2026 » pour une valeur mensuelle, « 2024 » sinon. */
export function periodLabel(year: number, month: number | null): string {
  return month ? `${MONTHS[month - 1]} ${year}` : String(year);
}

/** Chiffres clés de l'accueil : un choix d'indicateurs, valeurs lues dans la fiche nationale. */
@Injectable()
export class KeyFiguresService {
  constructor(private readonly repository: KeyFiguresRepository) {}

  /** Contrat Indicator du site public. */
  async home(): Promise<Indicator[]> {
    const rows = await this.repository.withLatestValues();
    return rows.map(({ id, label, value, decimals, unit, year, month }) => ({
      id, label, value, decimals, unit, period: periodLabel(year, month),
    }));
  }

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

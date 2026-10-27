import { IsOptional, IsString, MaxLength } from "class-validator";

export class ListFigureValuesQuery {
  /** Fiche région : n'afficher que ses éléments. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  figureRegionId?: string;

  /** Indicateur : n'afficher que ses éléments. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  indicatorId?: string;
}

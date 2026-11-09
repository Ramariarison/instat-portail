import { IsInt, IsOptional, IsString, Length, Max, Min } from "class-validator";

export class CreateKeyFigureDto {
  /** Indicateur mis en avant : sa valeur la plus récente de la fiche nationale s'affiche à l'accueil. */
  @IsString()
  @Length(1, 100)
  indicatorId!: string;

  /** Libellé à l'accueil ; absent ou null : nom de l'indicateur. */
  @IsOptional()
  @IsString()
  @Length(1, 300)
  label?: string | null;

  /** Nombre de décimales affichées (0 à 6). */
  @IsInt()
  @Min(0)
  @Max(6)
  decimals!: number;

  @IsOptional()
  @IsInt()
  position?: number;
}

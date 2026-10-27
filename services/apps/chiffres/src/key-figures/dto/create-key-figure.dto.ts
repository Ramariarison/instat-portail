import { IsInt, IsNumber, IsOptional, IsString, Length, Max, MaxLength, Min } from "class-validator";

export class CreateKeyFigureDto {
  @IsString()
  @Length(1, 300)
  label!: string;

  @IsNumber()
  value!: number;

  /** Nombre de décimales affichées (0 à 6). */
  @IsInt()
  @Min(0)
  @Max(6)
  decimals!: number;

  @IsString()
  @MaxLength(50)
  unit!: string;

  /** Période de la valeur, libre : « 2025 », « mars 2026 ». */
  @IsString()
  @Length(1, 100)
  period!: string;

  @IsOptional()
  @IsInt()
  position?: number;
}

import { IsOptional, IsString, Length, MaxLength } from "class-validator";

export class CreateFigureRegionDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  /** Région du service Publications ; absente pour le niveau national (Madagascar). */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  regionId?: string | null;
}

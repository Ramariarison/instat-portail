import { IsInt, IsNumber, IsOptional, IsString, Length, Matches, Max, MaxLength, Min } from "class-validator";
import { HTTP_URL } from "@app/common";

export class CreateFigureValueDto {
  @IsString()
  @Length(1, 100)
  figureRegionId!: string;

  @IsString()
  @Length(1, 100)
  indicatorId!: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  @IsNumber()
  value!: number;

  @IsString()
  @Length(1, 50)
  unit!: string;

  @IsString()
  @Length(1, 500)
  source!: string;

  /** Lien vers la source : http(s) uniquement (affiché sur le site public). */
  @IsOptional()
  @Matches(HTTP_URL)
  @MaxLength(2048)
  link?: string | null;
}

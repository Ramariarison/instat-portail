import { IsOptional, IsString, Length, Matches, MaxLength } from "class-validator";
import { HREF } from "@app/common";

export class CreateNewsDto {
  @IsString()
  @Length(1, 500)
  title!: string;

  /** Date de tri, AAAA-MM-JJ (facultative). */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string | null;

  /** Libellé affiché, libre : « 22 et 23 janvier 2026 ». */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  dateLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  context?: string | null;

  @IsOptional()
  @Matches(HREF)
  @MaxLength(2048)
  href?: string | null;
}

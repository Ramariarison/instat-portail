import { IsBoolean, IsOptional, IsString, Length, Matches, MaxLength } from "class-validator";
import { ALIAS, IMAGE_URL } from "@app/common";

export class CreateThematiqueDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  /** Alias d'URL, unique : « eau-assainissement-et-hygiene » → #/themes/eau-assainissement-et-hygiene. */
  @Matches(ALIAS)
  @MaxLength(200)
  alias!: string;

  @IsOptional()
  @Matches(IMAGE_URL)
  @MaxLength(2048)
  pictoUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  covid?: boolean;

  @IsOptional()
  @IsBoolean()
  inMenuPublications?: boolean;

  @IsOptional()
  @IsBoolean()
  inMenuThemes?: boolean;

  @IsOptional()
  @IsBoolean()
  inMenuServices?: boolean;
}

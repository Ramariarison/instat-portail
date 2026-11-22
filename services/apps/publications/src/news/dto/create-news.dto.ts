import { IsOptional, IsString, Length, Matches, MaxLength } from "class-validator";
import { HREF, IMAGE_URL } from "@app/common";

export class CreateNewsDto {
  @IsString()
  @Length(1, 500)
  title!: string;

  /** Date de l'actualité, AAAA-MM-JJ : tri et affichage. */
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

  /** Image de l'actualité, adresse renvoyée par le service Fichiers. */
  @IsOptional()
  @Matches(IMAGE_URL)
  @MaxLength(2048)
  imageUrl?: string | null;

  /** Texte de l'actualité, paragraphes séparés par une ligne vide. */
  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  content?: string | null;

  /** Lien vers une autre page, à la place de la page de l'actualité (facultatif). */
  @IsOptional()
  @Matches(HREF)
  @MaxLength(2048)
  href?: string | null;
}

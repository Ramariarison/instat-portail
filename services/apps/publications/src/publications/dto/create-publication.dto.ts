import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { IMAGE_URL } from "@app/common";
import { SECTOR_IDS } from "../../sectors/sectors.constants";
import { PublicationDocumentDto } from "./publication-document.dto";

export class CreatePublicationDto {
  @IsString()
  @Length(1, 500)
  title!: string;

  /** Image du titre (900 × 600), adresse renvoyée par le service Fichiers. */
  @IsOptional()
  @Matches(IMAGE_URL)
  @MaxLength(2048)
  imageUrl?: string | null;

  @IsIn(["national", "regional"])
  level!: "national" | "regional";

  /** Obligatoire si `level` vaut « regional » ; effacée si « national ». */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  regionId?: string | null;

  @IsString()
  @Length(1, 100)
  thematiqueId!: string;

  @IsString()
  @Length(1, 2000)
  excerpt!: string;

  @IsString()
  @Length(1, 200_000)
  content!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => PublicationDocumentDto)
  documents?: PublicationDocumentDto[];

  /** Date de publication, AAAA-MM-JJ. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  date!: string;

  /** Une seule publication peut porter ce marqueur : il est retiré des autres. */
  @IsOptional()
  @IsBoolean()
  latestNipc?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(SECTOR_IDS, { each: true })
  sectors?: string[];
}

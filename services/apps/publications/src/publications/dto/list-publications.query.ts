import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { ToArray } from "@app/common";
import { SECTOR_IDS } from "../../sectors/sectors.constants";

/** Filtres de la liste publique : GET /publications?scope=…&q=…&sector=a&sector=b&limit=…&offset=… */
export class ListPublicationsQuery {
  @IsOptional()
  @IsIn(["national", "regional"])
  scope?: "national" | "regional";

  @IsOptional()
  @IsString()
  @MaxLength(100)
  thematiqueId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  regionId?: string;

  /** Recherche dans les titres, sans tenir compte des accents ni des majuscules. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  /** Au moins un de ces secteurs (paramètre répétable). */
  @IsOptional()
  @ToArray()
  @IsIn(SECTOR_IDS, { each: true })
  sector?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset: number = 0;
}

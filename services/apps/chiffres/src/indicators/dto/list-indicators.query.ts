import { IsOptional, IsString, MaxLength } from "class-validator";

export class ListIndicatorsQuery {
  /** Type de données : n'afficher que ses éléments. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  typeId?: string;
}

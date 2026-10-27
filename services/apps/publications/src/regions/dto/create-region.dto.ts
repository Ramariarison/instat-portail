import { IsString, Length, MaxLength } from "class-validator";

export class CreateRegionDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  /** Nom du fichier picto déjà présent sur le serveur, ex. « analamanga.png » (peut être vide). */
  @IsString()
  @MaxLength(255)
  picto!: string;
}

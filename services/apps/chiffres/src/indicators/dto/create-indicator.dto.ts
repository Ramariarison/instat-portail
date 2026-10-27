import { IsString, Length, MaxLength } from "class-validator";

export class CreateIndicatorDefDto {
  @IsString()
  @Length(1, 100)
  typeId!: string;

  @IsString()
  @Length(1, 300)
  name!: string;

  /** Nom du fichier picto PNG déjà présent sur le serveur (peut être vide). */
  @IsString()
  @MaxLength(255)
  picto!: string;
}

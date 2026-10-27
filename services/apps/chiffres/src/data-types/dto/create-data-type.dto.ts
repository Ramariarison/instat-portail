import { IsString, Length, MaxLength } from "class-validator";

export class CreateDataTypeDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  /** Nom du fichier picto PNG déjà présent sur le serveur (peut être vide). */
  @IsString()
  @MaxLength(255)
  picto!: string;
}

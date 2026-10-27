import { IsInt, IsString, Length, Min } from "class-validator";

/** Document joint (fichier stocké par le service Fichiers : `id` = identifiant du fichier). */
export class PublicationDocumentDto {
  @IsString()
  @Length(1, 100)
  id!: string;

  @IsString()
  @Length(1, 255)
  name!: string;

  @IsInt()
  @Min(0)
  size!: number;
}

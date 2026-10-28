import { IsString, Length } from "class-validator";

/** Renvoi d'une publication soumise : le commentaire explique à l'éditeur ce qu'il faut corriger. */
export class ReturnPublicationDto {
  @IsString()
  @Length(3, 5000)
  comment!: string;
}

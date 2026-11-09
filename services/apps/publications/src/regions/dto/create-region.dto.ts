import { IsString, Length } from "class-validator";

export class CreateRegionDto {
  /** Nom de la région ; c'est aussi lui qui la place sur la carte du site (silhouette, « Madagascar en chiffres »). */
  @IsString()
  @Length(1, 200)
  name!: string;
}

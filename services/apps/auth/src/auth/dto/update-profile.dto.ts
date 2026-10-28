import { IsString, Length } from "class-validator";

/** « Mon compte » : ce que chacun peut changer lui-même. L'e-mail (identifiant de connexion) se change par un administrateur. */
export class UpdateProfileDto {
  @IsString()
  @Length(2, 200)
  name!: string;
}

import { PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";

/** Mise à jour partielle d'un compte ; `password` présent = nouveau mot de passe. */
export class UpdateUserDto extends PartialType(CreateUserDto) {}

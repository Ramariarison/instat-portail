import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Length, MaxLength, MinLength } from "class-validator";
import { type Role, roles } from "@app/common";
import { PASSWORD_MIN_LENGTH } from "../user.constants";

export class CreateUserDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsIn(roles)
  role!: Role;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  /** Facultatif : sans mot de passe, le compte ne peut pas se connecter. */
  @IsOptional()
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(200)
  password?: string;
}

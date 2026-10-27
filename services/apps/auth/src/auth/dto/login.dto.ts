import { IsString, Length } from "class-validator";

export class LoginDto {
  @IsString()
  @Length(1, 254)
  email!: string;

  @IsString()
  @Length(1, 200)
  password!: string;
}

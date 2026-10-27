import { IsString, MaxLength, MinLength } from "class-validator";
import { PASSWORD_MIN_LENGTH } from "../../users/user.constants";

export class ChangePasswordDto {
  @IsString()
  @MaxLength(200)
  currentPassword!: string;

  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(200)
  newPassword!: string;
}

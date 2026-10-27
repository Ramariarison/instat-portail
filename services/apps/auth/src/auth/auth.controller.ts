import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, permissions, Public, type TokenPayload, type User } from "@app/common";
import { AuthService } from "./auth.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import type { LoginResponse } from "./login-response";

@ApiTags("Authentification")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(200)
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.auth.login(dto);
  }

  @ApiBearerAuth()
  @Get("me")
  me(@CurrentUser() actor: TokenPayload): Promise<User> {
    return this.auth.me(actor);
  }

  @ApiBearerAuth()
  @Post("password")
  @HttpCode(204)
  changePassword(@CurrentUser() actor: TokenPayload, @Body() dto: ChangePasswordDto): Promise<void> {
    return this.auth.changePassword(actor, dto);
  }

  /** Matrice des droits par rôle (la même que celle du front). */
  @Public()
  @Get("permissions")
  permissions(): typeof permissions {
    return permissions;
  }
}

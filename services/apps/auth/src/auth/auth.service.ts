import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { type AdminUser, ApiException, type TokenPayload, type User } from "@app/common";
import { PasswordService } from "../password/password.service";
import { UsersRepository } from "../users/users.repository";
import type { ChangePasswordDto } from "./dto/change-password.dto";
import type { LoginDto } from "./dto/login.dto";
import type { LoginResponse } from "./login-response";

const TOKEN_TTL = Number(process.env.JWT_TTL_SECONDS ?? 8 * 3600);

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const account = await this.users.findCredentialsByEmail(dto.email.trim());
    // Le mot de passe est toujours comparé, même si l'adresse est inconnue : même temps de réponse.
    const valid = await this.passwords.verify(dto.password, account?.passwordHash);
    if (!account || !valid) {
      throw new ApiException(401, "INVALID_CREDENTIALS", "Adresse e-mail ou mot de passe incorrect.");
    }
    if (!account.active) throw new ApiException(403, "ACCOUNT_DISABLED", "Ce compte est désactivé.");

    await this.users.recordLogin(account.id);
    const user: User = { id: account.id, name: account.name, email: account.email, role: account.role };
    const claims: TokenPayload = { sub: user.id, role: user.role, name: user.name, email: user.email };
    return { token: await this.jwt.signAsync(claims), expiresIn: TOKEN_TTL, user };
  }

  /** Compte du jeton, relu en base : un compte supprimé ou désactivé n'a plus de session. */
  async currentAccount(actor: TokenPayload): Promise<AdminUser> {
    const account = await this.users.findById(actor.sub);
    if (!account?.active) {
      throw new ApiException(401, "INVALID_TOKEN", "Session expirée ou invalide : reconnectez-vous.");
    }
    return account;
  }

  async me(actor: TokenPayload): Promise<User> {
    const { id, name, email, role } = await this.currentAccount(actor);
    return { id, name, email, role };
  }

  async changePassword(actor: TokenPayload, dto: ChangePasswordDto): Promise<void> {
    const account = await this.currentAccount(actor);
    const stored = await this.users.findPasswordHash(account.id);
    if (!stored || !(await this.passwords.verify(dto.currentPassword, stored))) {
      throw ApiException.badRequest("Le mot de passe actuel est incorrect.", "INVALID_PASSWORD");
    }
    await this.users.update(account.id, { passwordHash: await this.passwords.hash(dto.newPassword) });
  }
}

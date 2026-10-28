import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type AdminUser, ApiException, type Db, PG_POOL, runInTransaction, type TokenPayload } from "@app/common";
import { PasswordService } from "../password/password.service";
import { canCreateAccount, canDeleteAccount, canUpdateAccount, type Decision } from "./account-policy";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";

/**
 * Gestion des comptes. Règles tenues ici, quel que soit le front (détail dans account-policy.ts) :
 * l'administrateur ne gère que les comptes éditeurs ; personne ne modifie son propre rôle ni ne se suspend,
 * ni ne se supprime ; il reste toujours au moins un super administrateur actif.
 */
@Injectable()
export class UsersService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly users: UsersRepository,
    private readonly passwords: PasswordService,
  ) {}

  findAll(): Promise<AdminUser[]> {
    return this.users.findAll();
  }

  findOne(id: string): Promise<AdminUser> {
    return this.users.getById(id);
  }

  async create(dto: CreateUserDto, actor: TokenPayload): Promise<AdminUser> {
    this.enforce(canCreateAccount(this.asActor(actor), dto.role));
    return this.users.insert(await this.toRow(dto));
  }

  update(id: string, dto: UpdateUserDto, actor: TokenPayload): Promise<AdminUser> {
    return runInTransaction(this.pool, async (client) => {
      const before = await this.users.lockStatus(id, client);
      if (!before) throw ApiException.notFound("Utilisateur");
      this.enforce(canUpdateAccount(this.asActor(actor), { id, ...before }, dto));

      const roleChanged = dto.role !== undefined && dto.role !== before.role;
      const disabled = dto.active === false && before.active;
      if (before.role === "super_admin" && before.active && (roleChanged || disabled)) {
        await this.assertAnotherSuperAdmin(id, client);
      }
      return this.users.update(id, await this.toRow(dto), client);
    });
  }

  async remove(id: string, actor: TokenPayload): Promise<void> {
    this.enforce(canDeleteAccount(this.asActor(actor), { id }));
    await runInTransaction(this.pool, async (client) => {
      const before = await this.users.lockStatus(id, client);
      if (!before) throw ApiException.notFound("Utilisateur");
      if (before.role === "super_admin" && before.active) await this.assertAnotherSuperAdmin(id, client);
      await this.users.delete(id, client);
    });
  }

  /** Normalise le nom et l'e-mail, et remplace le mot de passe par son empreinte. */
  private async toRow(dto: UpdateUserDto): Promise<Record<string, unknown>> {
    const { password, ...rest } = dto;
    return {
      ...rest,
      name: rest.name?.trim(),
      email: rest.email?.trim().toLowerCase(),
      passwordHash: password ? await this.passwords.hash(password) : undefined,
    };
  }

  private asActor(actor: TokenPayload): { id: string; role: TokenPayload["role"] } {
    return { id: actor.sub, role: actor.role };
  }

  private enforce(decision: Decision): void {
    if (!decision.allowed) throw new ApiException(403, decision.code, decision.reason);
  }

  private async assertAnotherSuperAdmin(exceptId: string, db: Db): Promise<void> {
    if ((await this.users.countActiveSuperAdmins(exceptId, db)) === 0) {
      throw ApiException.conflict("LAST_SUPER_ADMIN", "Il doit rester au moins un super administrateur actif.");
    }
  }
}

import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type AdminUser, ApiException, type Db, PG_POOL, runInTransaction, type TokenPayload } from "@app/common";
import { PasswordService } from "../password/password.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./users.repository";

/**
 * Gestion des comptes. Règles tenues ici, quel que soit le front :
 * on ne modifie ni son propre rôle ni son propre statut, on ne se supprime pas,
 * et il reste toujours au moins un super administrateur actif.
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

  async create(dto: CreateUserDto): Promise<AdminUser> {
    return this.users.insert(await this.toRow(dto));
  }

  update(id: string, dto: UpdateUserDto, actor: TokenPayload): Promise<AdminUser> {
    return runInTransaction(this.pool, async (client) => {
      const before = await this.users.lockStatus(id, client);
      if (!before) throw ApiException.notFound("Utilisateur");

      const roleChanged = dto.role !== undefined && dto.role !== before.role;
      const disabled = dto.active === false && before.active;
      if (id === actor.sub && (roleChanged || disabled)) {
        throw new ApiException(403, "SELF_LOCKOUT", "Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte.");
      }
      if (before.role === "super_admin" && before.active && (roleChanged || disabled)) {
        await this.assertAnotherSuperAdmin(id, client);
      }
      return this.users.update(id, await this.toRow(dto), client);
    });
  }

  async remove(id: string, actor: TokenPayload): Promise<void> {
    if (id === actor.sub) {
      throw new ApiException(403, "SELF_LOCKOUT", "Vous ne pouvez pas supprimer votre propre compte.");
    }
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

  private async assertAnotherSuperAdmin(exceptId: string, db: Db): Promise<void> {
    if ((await this.users.countActiveSuperAdmins(exceptId, db)) === 0) {
      throw ApiException.conflict("LAST_SUPER_ADMIN", "Il doit rester au moins un super administrateur actif.");
    }
  }
}

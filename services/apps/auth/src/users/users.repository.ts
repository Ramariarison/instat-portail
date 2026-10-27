import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { type AdminUser, type Db, PG_POOL, SqlRepository, type TableDefinition } from "@app/common";

/** Ligne complète d'un compte, pour la connexion (avec l'empreinte du mot de passe). */
export interface UserCredentials {
  id: string;
  name: string;
  email: string;
  role: AdminUser["role"];
  active: boolean;
  passwordHash: string | null;
}

@Injectable()
export class UsersRepository extends SqlRepository<AdminUser> {
  protected readonly table: TableDefinition = {
    name: "users",
    label: "Utilisateur",
    idPrefix: "user",
    columns: {
      name: "name",
      email: "email",
      role: "role",
      active: "active",
      lastLogin: "last_login",
      passwordHash: "password_hash",
    },
    writeOnly: ["passwordHash"],
    orderBy: "name",
  };

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }

  async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    const { rows } = await this.pool.query<UserCredentials>(
      `SELECT id, name, email, role, active, password_hash AS "passwordHash"
       FROM users WHERE lower(email) = lower($1)`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findPasswordHash(id: string): Promise<string | null> {
    const { rows } = await this.pool.query<{ hash: string | null }>("SELECT password_hash AS hash FROM users WHERE id = $1", [id]);
    return rows[0]?.hash ?? null;
  }

  async recordLogin(id: string): Promise<void> {
    await this.pool.query("UPDATE users SET last_login = now() WHERE id = $1", [id]);
  }

  /** Verrouille la ligne jusqu'à la fin de la transaction (contrôles avant modification). */
  async lockStatus(id: string, db: Db): Promise<Pick<AdminUser, "role" | "active"> | null> {
    const { rows } = await db.query("SELECT role, active FROM users WHERE id = $1 FOR UPDATE", [id]);
    return rows[0] ?? null;
  }

  async countActiveSuperAdmins(exceptId: string | null, db: Db = this.pool): Promise<number> {
    const { rows } = await db.query<{ count: number }>(
      "SELECT count(*)::int AS count FROM users WHERE role = 'super_admin' AND active AND id IS DISTINCT FROM $1",
      [exceptId],
    );
    return rows[0]!.count;
  }

  async count(): Promise<number> {
    const { rows } = await this.pool.query<{ count: number }>("SELECT count(*)::int AS count FROM users");
    return rows[0]!.count;
  }
}

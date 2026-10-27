import { Inject, Injectable, Logger, type OnApplicationBootstrap } from "@nestjs/common";
import type { Pool } from "pg";
import { newId, PG_POOL } from "@app/common";
import { PasswordService } from "../password/password.service";
import { UsersRepository } from "../users/users.repository";
import { DEMO_PASSWORD, demoUsers } from "./demo-users";

/**
 * Comptes créés au démarrage (après les migrations) :
 * - SEED_DEMO=true : comptes de démonstration, seulement si la table est vide (jamais en production) ;
 * - BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD : premier super administrateur s'il n'en existe aucun d'actif.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly users: UsersRepository,
    private readonly passwords: PasswordService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_DEMO === "true") await this.seedDemoUsers();
    await this.bootstrapSuperAdmin();
  }

  private async seedDemoUsers(): Promise<void> {
    if ((await this.users.count()) > 0) return;
    const hash = await this.passwords.hash(DEMO_PASSWORD);
    for (const user of demoUsers) {
      await this.pool.query(
        `INSERT INTO users (id, name, email, role, active, password_hash, last_login)
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
        [user.id, user.name, user.email, user.role, user.active, hash, user.lastLogin ?? null],
      );
    }
    this.logger.log(`${demoUsers.length} comptes de démonstration créés.`);
  }

  private async bootstrapSuperAdmin(): Promise<void> {
    const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (!email || !password) return;
    if (password.length < 12) throw new Error("BOOTSTRAP_ADMIN_PASSWORD doit faire au moins 12 caractères.");
    if ((await this.users.countActiveSuperAdmins(null)) > 0) return;

    const hash = await this.passwords.hash(password);
    const promoted = await this.pool.query(
      "UPDATE users SET role = 'super_admin', active = true, password_hash = $2 WHERE lower(email) = $1",
      [email, hash],
    );
    if (!promoted.rowCount) {
      await this.pool.query(
        `INSERT INTO users (id, name, email, role, active, password_hash)
         VALUES ($1, 'Super administrateur', $2, 'super_admin', true, $3)`,
        [newId("user"), email, hash],
      );
    }
    this.logger.log(`Super administrateur initial : ${email}`);
  }
}

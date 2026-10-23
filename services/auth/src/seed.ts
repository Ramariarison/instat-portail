import type pg from "pg";
import type { AdminUser } from "../../shared/contract.ts";
import { newId } from "../../shared/ids.ts";
import { hashPassword } from "./password.ts";

/**
 * Comptes de démonstration (mêmes que instat-front-v2/src/admin/data/seed.ts), mot de passe « demo1234 ».
 * Créés seulement si SEED_DEMO=true et si la table est vide. Jamais en production.
 */
const demoUsers: AdminUser[] = [
  { id: "demo-1", name: "Super admin démo", email: "superadmin@instat.demo", role: "super_admin", active: true, lastLogin: "2026-10-09T08:12:00" },
  { id: "demo-2", name: "Admin démo", email: "admin@instat.demo", role: "admin", active: true, lastLogin: "2026-10-08T15:40:00" },
  { id: "demo-3", name: "Éditeur démo", email: "editeur@instat.demo", role: "editor", active: true, lastLogin: "2026-10-07T10:05:00" },
  { id: "user-4", name: "Voahangy Exemple", email: "voahangy@instat.demo", role: "editor", active: true, lastLogin: "2026-09-30T09:30:00" },
  { id: "user-5", name: "Tahiry Exemple", email: "tahiry@instat.demo", role: "admin", active: false },
];

export async function seedDemoUsers(pool: pg.Pool): Promise<void> {
  const { rows } = await pool.query<{ count: number }>("SELECT count(*)::int AS count FROM users");
  if (rows[0].count > 0) return;
  const hash = await hashPassword("demo1234");
  for (const user of demoUsers) {
    await pool.query(
      `INSERT INTO users (id, name, email, role, active, password_hash, last_login)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING`,
      [user.id, user.name, user.email, user.role, user.active, hash, user.lastLogin ?? null],
    );
  }
}

/**
 * Premier super administrateur en production : créé à partir de BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD
 * s'il n'existe encore aucun super administrateur actif.
 */
export async function bootstrapSuperAdmin(pool: pg.Pool): Promise<void> {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) return;
  if (password.length < 12) throw new Error("BOOTSTRAP_ADMIN_PASSWORD doit faire au moins 12 caractères.");

  const { rows } = await pool.query<{ count: number }>(
    "SELECT count(*)::int AS count FROM users WHERE role = 'super_admin' AND active",
  );
  if (rows[0].count > 0) return;
  const hash = await hashPassword(password);
  const promoted = await pool.query(
    "UPDATE users SET role = 'super_admin', active = true, password_hash = $2 WHERE lower(email) = $1",
    [email, hash],
  );
  if (promoted.rowCount === 0) {
    await pool.query(
      `INSERT INTO users (id, name, email, role, active, password_hash)
       VALUES ($1, 'Super administrateur', $2, 'super_admin', true, $3)`,
      [newId("user"), email, hash],
    );
  }
}

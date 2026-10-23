import { randomBytes } from "node:crypto";
import type { FastifyRequest } from "fastify";
import type { AdminUser, User } from "../../shared/contract.ts";
import { roles } from "../../shared/contract.ts";
import { findAll, findOne, idParams, insertRow, type Table, updateRow } from "../../shared/crud.ts";
import { createPool, migrate, transaction, type Db } from "../../shared/db.ts";
import { authenticate, createApp, HttpError, notFound, requirePermission, start } from "../../shared/http.ts";
import { signToken } from "../../shared/jwt.ts";
import { permissions } from "../../shared/permissions.ts";
import { hashPassword, verifyPassword } from "./password.ts";
import { bootstrapSuperAdmin, seedDemoUsers } from "./seed.ts";

/**
 * Service Auth / Utilisateurs.
 *   POST /auth/login        connexion → { token, expiresIn, user }
 *   GET  /auth/me           utilisateur du jeton (relu en base : un compte désactivé est refusé)
 *   POST /auth/password     changer son propre mot de passe
 *   GET  /auth/permissions  matrice RBAC (rôle → ressource → actions)
 *   /users                  gestion des comptes (droit « users », super administrateur seulement)
 */

const TOKEN_TTL = Number(process.env.JWT_TTL_SECONDS ?? 8 * 3600);
const MIN_PASSWORD = 8;

const users: Table = {
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

const pool = createPool();
await migrate(pool, new URL("../migrations", import.meta.url).pathname);
if (process.env.SEED_DEMO === "true") await seedDemoUsers(pool);
await bootstrapSuperAdmin(pool);

// Comparé quand l'adresse est inconnue, pour que la réponse prenne le même temps.
const dummyHash = await hashPassword(randomBytes(16).toString("hex"));

const app = createApp("auth");

const loginBody = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", minLength: 1, maxLength: 254 },
    password: { type: "string", minLength: 1, maxLength: 200 },
  },
};

app.post<{ Body: { email: string; password: string } }>("/auth/login", { schema: { body: loginBody } }, async (request) => {
  const { rows } = await pool.query(
    "SELECT id, name, email, role, active, password_hash FROM users WHERE lower(email) = lower($1)",
    [request.body.email.trim()],
  );
  const account = rows[0];
  const valid = await verifyPassword(request.body.password, account?.password_hash ?? dummyHash);
  if (!account || !account.password_hash || !valid) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Adresse e-mail ou mot de passe incorrect.");
  }
  if (!account.active) throw new HttpError(403, "ACCOUNT_DISABLED", "Ce compte est désactivé.");

  await pool.query("UPDATE users SET last_login = now() WHERE id = $1", [account.id]);
  const user: User = { id: account.id, name: account.name, email: account.email, role: account.role };
  return {
    token: signToken({ sub: user.id, role: user.role, name: user.name, email: user.email }, TOKEN_TTL),
    expiresIn: TOKEN_TTL,
    user,
  };
});

async function currentUser(request: FastifyRequest): Promise<AdminUser> {
  const { sub } = authenticate(request);
  const user = await findOne<AdminUser>(pool, users, sub).catch(() => null);
  if (!user || !user.active) throw new HttpError(401, "INVALID_TOKEN", "Session expirée ou invalide : reconnectez-vous.");
  return user;
}

app.get("/auth/me", async (request): Promise<User> => {
  const { id, name, email, role } = await currentUser(request);
  return { id, name, email, role };
});

app.post<{ Body: { currentPassword: string; newPassword: string } }>(
  "/auth/password",
  {
    schema: {
      body: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string", maxLength: 200 },
          newPassword: { type: "string", minLength: MIN_PASSWORD, maxLength: 200 },
        },
      },
    },
  },
  async (request, reply) => {
    const user = await currentUser(request);
    const { rows } = await pool.query("SELECT password_hash FROM users WHERE id = $1", [user.id]);
    const stored: string | null = rows[0]?.password_hash ?? null;
    if (!stored || !(await verifyPassword(request.body.currentPassword, stored))) {
      throw new HttpError(400, "INVALID_PASSWORD", "Le mot de passe actuel est incorrect.");
    }
    await pool.query("UPDATE users SET password_hash = $2 WHERE id = $1", [user.id, await hashPassword(request.body.newPassword)]);
    return reply.code(204).send();
  },
);

app.get("/auth/permissions", async () => permissions);

// --- Gestion des comptes ---

const userProperties = {
  name: { type: "string", minLength: 1, maxLength: 200 },
  email: { type: "string", format: "email", maxLength: 254 },
  role: { type: "string", enum: roles },
  active: { type: "boolean" },
  /** Facultatif : sans mot de passe, le compte ne peut pas se connecter. */
  password: { type: "string", minLength: MIN_PASSWORD, maxLength: 200 },
};

interface UserInput {
  name?: string;
  email?: string;
  role?: AdminUser["role"];
  active?: boolean;
  password?: string;
}

async function toRow(input: UserInput): Promise<Record<string, unknown>> {
  const { password, ...rest } = input;
  return {
    ...rest,
    name: rest.name?.trim(),
    email: rest.email?.trim().toLowerCase(),
    passwordHash: password ? await hashPassword(password) : undefined,
  };
}

/** Refuse de laisser le site sans super administrateur actif. */
async function assertAnotherSuperAdmin(db: Db, exceptId: string): Promise<void> {
  const { rows } = await db.query<{ count: number }>(
    "SELECT count(*)::int AS count FROM users WHERE role = 'super_admin' AND active AND id <> $1",
    [exceptId],
  );
  if (rows[0].count === 0) {
    throw new HttpError(409, "LAST_SUPER_ADMIN", "Il doit rester au moins un super administrateur actif.");
  }
}

app.get("/users", { preHandler: requirePermission("users", "view") }, () => findAll<AdminUser>(pool, users));

app.get<{ Params: { id: string } }>(
  "/users/:id",
  { preHandler: requirePermission("users", "view"), schema: { params: idParams } },
  (request) => findOne<AdminUser>(pool, users, request.params.id),
);

app.post<{ Body: UserInput }>(
  "/users",
  {
    preHandler: requirePermission("users", "create"),
    schema: { body: { type: "object", additionalProperties: false, required: ["name", "email", "role"], properties: userProperties } },
  },
  async (request, reply) => reply.code(201).send(await insertRow<AdminUser>(pool, users, await toRow(request.body))),
);

app.patch<{ Params: { id: string }; Body: UserInput }>(
  "/users/:id",
  {
    preHandler: requirePermission("users", "update"),
    schema: { params: idParams, body: { type: "object", additionalProperties: false, properties: userProperties } },
  },
  async (request) => {
    const { id } = request.params;
    const patch = request.body;
    return transaction(pool, async (client) => {
      const { rows } = await client.query("SELECT role, active FROM users WHERE id = $1 FOR UPDATE", [id]);
      if (rows.length === 0) throw notFound(users.label);
      const before = rows[0] as { role: string; active: boolean };

      const demoted = patch.role !== undefined && patch.role !== before.role;
      const disabled = patch.active === false && before.active;
      if (id === request.user?.sub && (demoted || disabled)) {
        throw new HttpError(403, "SELF_LOCKOUT", "Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte.");
      }
      if (before.role === "super_admin" && before.active && (demoted || disabled)) {
        await assertAnotherSuperAdmin(client, id);
      }
      return updateRow<AdminUser>(client, users, id, await toRow(patch));
    });
  },
);

app.delete<{ Params: { id: string } }>(
  "/users/:id",
  { preHandler: requirePermission("users", "delete"), schema: { params: idParams } },
  async (request, reply) => {
    const { id } = request.params;
    if (id === request.user?.sub) {
      throw new HttpError(403, "SELF_LOCKOUT", "Vous ne pouvez pas supprimer votre propre compte.");
    }
    await transaction(pool, async (client) => {
      const { rows } = await client.query("SELECT role, active FROM users WHERE id = $1 FOR UPDATE", [id]);
      if (rows.length === 0) throw notFound(users.label);
      if (rows[0].role === "super_admin" && rows[0].active) await assertAnotherSuperAdmin(client, id);
      await client.query("DELETE FROM users WHERE id = $1", [id]);
    });
    return reply.code(204).send();
  },
);

await start(app, pool);

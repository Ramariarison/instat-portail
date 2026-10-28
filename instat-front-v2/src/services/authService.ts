import { api, ApiError, getToken, setToken } from "../lib/api";
import type { Role, User } from "../types";

/**
 * Authentification par le service Auth (via la passerelle) :
 * POST /auth/login renvoie un jeton JWT portant le rôle, envoyé ensuite à chaque requête.
 */

interface DemoAccount {
  id: string;
  email: string;
  password: string;
  role: Role;
}

/** Comptes créés par le service Auth quand SEED_DEMO=true (voir SHOW_DEMO_ACCOUNTS dans config.ts). */
export const demoAccounts: DemoAccount[] = [
  { id: "demo-1", email: "superadmin@instat.demo", password: "demo1234", role: "super_admin" },
  { id: "demo-2", email: "admin@instat.demo", password: "demo1234", role: "admin" },
  { id: "demo-3", email: "editeur@instat.demo", password: "demo1234", role: "editor" },
];

export class InvalidCredentialsError extends Error {
  constructor() {
    super("INVALID_CREDENTIALS");
    this.name = "InvalidCredentialsError";
  }
}

interface LoginResponse {
  token: string;
  expiresIn: number;
  user: User;
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const { token, user } = await api.post<LoginResponse>("/auth/login", { email: email.trim(), password });
    setToken(token);
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") throw new InvalidCredentialsError();
    throw error;
  }
}

/** Utilisateur du jeton gardé dans l'onglet, ou null. Un jeton refusé est effacé. */
export async function restoreSession(): Promise<User | null> {
  if (!getToken()) return null;
  try {
    return await api.get<User>("/auth/me");
  } catch {
    // 401 : le client d'API a déjà effacé le jeton. Serveur injoignable : on réessaiera au prochain chargement.
    return null;
  }
}

/** « Mon compte » : changer son nom. Renvoie l'utilisateur à jour. */
export function updateProfile(name: string): Promise<User> {
  return api.patch<User>("/auth/me", { name });
}

/** « Mon compte » : changer son mot de passe (l'actuel est vérifié par le service). */
export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return api.post<void>("/auth/password", { currentPassword, newPassword });
}

export function signOut(): void {
  setToken(null);
}

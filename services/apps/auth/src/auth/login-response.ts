import type { User } from "@app/common";

/** Réponse de POST /auth/login : le jeton à renvoyer dans « Authorization: Bearer … ». */
export interface LoginResponse {
  token: string;
  /** Durée de validité du jeton, en secondes. */
  expiresIn: number;
  user: User;
}

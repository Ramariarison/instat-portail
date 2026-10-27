import type { Role } from "../contract/contract.types";

/** Contenu du jeton JWT signé par le service Auth et vérifié par chaque service. */
export interface TokenPayload {
  sub: string;
  role: Role;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
}

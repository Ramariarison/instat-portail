import { createHmac, timingSafeEqual } from "node:crypto";
import { roles, type Role } from "./contract.ts";

/**
 * Jetons JWT HS256 : signés par le service Auth, vérifiés par chaque service avec le même JWT_SECRET.
 * Seul l'algorithme HS256 est accepté (l'en-tête est comparé tel quel : pas de « alg: none »).
 */

export interface TokenPayload {
  sub: string;
  role: Role;
  name: string;
  email: string;
  iat: number;
  exp: number;
}

const HEADER = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error("JWT_SECRET doit être défini et faire au moins 32 caractères.");
  return value;
}

/** À appeler au démarrage pour échouer tout de suite si la configuration est absente. */
export function assertJwtConfigured(): void {
  secret();
}

function sign(input: string): Buffer {
  return createHmac("sha256", secret()).update(input).digest();
}

export function signToken(claims: Omit<TokenPayload, "iat" | "exp">, ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = { ...claims, iat: now, exp: now + ttlSeconds };
  const body = `${HEADER}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
  return `${body}.${sign(body).toString("base64url")}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== HEADER) return null;

  const expected = sign(`${parts[0]}.${parts[1]}`);
  const given = Buffer.from(parts[2], "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as TokenPayload;
    if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (typeof payload.sub !== "string" || !roles.includes(payload.role)) return null;
    return payload;
  } catch {
    return null;
  }
}

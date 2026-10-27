import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { Injectable, type OnModuleInit } from "@nestjs/common";

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

/** Hachage scrypt (module crypto de Node, sans dépendance) : « scrypt$N$r$p$sel$clé ». */
@Injectable()
export class PasswordService implements OnModuleInit {
  /** Empreinte d'un mot de passe aléatoire : comparée quand l'adresse est inconnue, pour un temps de réponse égal. */
  private dummyHash = "";

  async onModuleInit(): Promise<void> {
    this.dummyHash = await this.hash(randomBytes(16).toString("hex"));
  }

  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await this.derive(password, salt, N, R, P);
    return ["scrypt", N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
  }

  /** Vérifie un mot de passe ; sans empreinte enregistrée, compare quand même (temps constant) et renvoie faux. */
  async verify(password: string, stored: string | null | undefined): Promise<boolean> {
    const [scheme, n, r, p, salt, key] = (stored ?? this.dummyHash).split("$");
    if (scheme !== "scrypt" || !salt || !key) return false;
    const expected = Buffer.from(key, "base64");
    const actual = await this.derive(password, Buffer.from(salt, "base64"), Number(n), Number(r), Number(p));
    return Boolean(stored) && actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private derive(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
    return new Promise((resolve, reject) =>
      scrypt(password, salt, KEY_LENGTH, { N: n, r, p }, (error, key) => (error ? reject(error) : resolve(key))),
    );
  }
}

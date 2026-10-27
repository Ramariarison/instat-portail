import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { AccessGuard } from "./access.guard";

/** Lit JWT_SECRET (HS256, 32 caractères minimum) et refuse de démarrer sans lui. */
function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET doit être défini et faire au moins 32 caractères.");
  return secret;
}

/**
 * Sécurité commune : vérification des jetons et garde globale (AccessGuard) sur toutes les routes.
 * Le service Auth s'en sert aussi pour signer (JwtService).
 */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: jwtSecret(),
        signOptions: { algorithm: "HS256", expiresIn: Number(process.env.JWT_TTL_SECONDS ?? 8 * 3600) },
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: AccessGuard }],
  exports: [JwtModule],
})
export class SecurityModule {}

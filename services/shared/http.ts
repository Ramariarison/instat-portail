import Fastify, { type FastifyError, type FastifyInstance, type FastifyRequest } from "fastify";
import type pg from "pg";
import { assertJwtConfigured, verifyToken, type TokenPayload } from "./jwt.ts";
import { can, type Action, type Resource } from "./permissions.ts";

declare module "fastify" {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

/**
 * Erreur métier renvoyée telle quelle au client : `{ "error": { "code": "...", "message": "..." } }`.
 * Le `code` est stable (le front peut s'en servir) ; le `message` est en français, prêt à afficher.
 */
export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function notFound(label: string): HttpError {
  return new HttpError(404, "NOT_FOUND", `${label} introuvable.`);
}

type AppError = FastifyError & { detail?: string };

/** Erreurs PostgreSQL les plus courantes, traduites en réponses lisibles. */
function fromPostgres(error: AppError): HttpError | null {
  switch (error.code) {
    case "23505":
      return new HttpError(409, "ALREADY_EXISTS", "Cette valeur est déjà utilisée par un autre élément.");
    case "23503":
      return error.detail?.includes("is still referenced")
        ? new HttpError(409, "IN_USE", "Cet élément est encore utilisé ailleurs : suppression impossible.")
        : new HttpError(400, "INVALID_REFERENCE", "Un élément référencé n'existe pas.");
    case "23514":
    case "22P02":
    case "22007":
    case "22008":
      return new HttpError(400, "VALIDATION_ERROR", "Une valeur envoyée n'est pas valide.");
    default:
      return null;
  }
}

export function createApp(service: string): FastifyInstance {
  assertJwtConfigured();

  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? "info" },
    trustProxy: true,
    bodyLimit: 2 * 1024 * 1024,
  });

  app.setErrorHandler<AppError>((error, request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({ error: { code: error.code, message: error.message } });
    }
    if (error.validation) {
      return reply.code(400).send({ error: { code: "VALIDATION_ERROR", message: `Requête invalide : ${error.message}` } });
    }
    const mapped = fromPostgres(error);
    if (mapped) {
      request.log.info({ err: error }, "contrainte de base de données");
      return reply.code(mapped.statusCode).send({ error: { code: mapped.code, message: mapped.message } });
    }
    if (error.statusCode && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ error: { code: error.code ?? "BAD_REQUEST", message: error.message } });
    }
    request.log.error({ err: error }, "erreur inattendue");
    return reply.code(500).send({ error: { code: "INTERNAL", message: "Erreur interne du service." } });
  });

  app.setNotFoundHandler((_request, reply) =>
    reply.code(404).send({ error: { code: "NOT_FOUND", message: "Route inconnue." } }),
  );

  app.get("/health", async () => ({ status: "ok", service }));
  return app;
}

/** Démarre l'écoute et ferme proprement (requêtes en cours, pool SQL) sur SIGTERM / SIGINT. */
export async function start(app: FastifyInstance, pool?: pg.Pool): Promise<void> {
  const shutdown = async () => {
    await app.close();
    await pool?.end();
    process.exit(0);
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
  await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3000) });
}

export function authenticate(request: FastifyRequest): TokenPayload {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) throw new HttpError(401, "UNAUTHENTICATED", "Connexion requise.");
  const payload = verifyToken(token);
  if (!payload) throw new HttpError(401, "INVALID_TOKEN", "Session expirée ou invalide : reconnectez-vous.");
  request.user = payload;
  return payload;
}

/** preHandler : n'importe quel utilisateur connecté. */
export async function requireUser(request: FastifyRequest): Promise<void> {
  authenticate(request);
}

/** preHandler : utilisateur connecté dont le rôle a le droit `action` sur `resource` (matrice RBAC). */
export function requirePermission(resource: Resource, action: Action) {
  return async (request: FastifyRequest): Promise<void> => {
    const user = authenticate(request);
    if (!can(user.role, resource, action)) {
      throw new HttpError(403, "FORBIDDEN", "Votre rôle ne permet pas cette action.");
    }
  };
}

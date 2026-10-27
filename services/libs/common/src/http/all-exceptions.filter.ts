import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { ApiException } from "./api.exception";
import { fromPostgresError } from "./postgres-errors";

interface ErrorBody {
  error: { code: string; message: string };
}

/**
 * Toutes les erreurs sortent au même format : `{ "error": { "code", "message" } }`.
 * Ordre : erreurs métier (ApiException), erreurs HTTP de Nest, contraintes PostgreSQL, puis 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const [status, body] = this.toResponse(exception);
    void reply.status(status).send(body);
  }

  private toResponse(exception: unknown): [number, ErrorBody] {
    if (exception instanceof ApiException) {
      return [exception.getStatus(), this.body(exception.code, exception.message)];
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === 404) return [404, this.body("NOT_FOUND", "Route inconnue.")];
      return [status, this.body(status === 401 ? "UNAUTHENTICATED" : "BAD_REQUEST", exception.message)];
    }

    const mapped = fromPostgresError(exception);
    if (mapped) {
      this.logger.log(`Contrainte de base de données : ${(exception as Error).message}`);
      return [mapped.getStatus(), this.body(mapped.code, mapped.message)];
    }

    // Erreurs de Fastify avant le routage (JSON mal formé, fichier trop gros…) : statut 4xx déjà fixé.
    const statusCode = (exception as { statusCode?: number }).statusCode;
    if (statusCode && statusCode < 500) {
      return [statusCode, this.body("BAD_REQUEST", (exception as Error).message)];
    }

    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return [500, this.body("INTERNAL", "Erreur interne du service.")];
  }

  private body(code: string, message: string): ErrorBody {
    return { error: { code, message } };
  }
}

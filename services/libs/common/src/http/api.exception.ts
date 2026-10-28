import { HttpException } from "@nestjs/common";

/**
 * Erreur métier renvoyée telle quelle au client : `{ "error": { "code": "...", "message": "..." } }`.
 * Le `code` est stable (le front peut s'en servir) ; le `message` est en français, prêt à afficher.
 */
export class ApiException extends HttpException {
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message, status);
    this.code = code;
  }

  static notFound(label: string): ApiException {
    return new ApiException(404, "NOT_FOUND", `${label} introuvable.`);
  }

  static forbidden(message = "Votre rôle ne permet pas cette action."): ApiException {
    return new ApiException(403, "FORBIDDEN", message);
  }

  static badRequest(message: string, code = "VALIDATION_ERROR"): ApiException {
    return new ApiException(400, code, message);
  }

  static conflict(code: string, message: string): ApiException {
    return new ApiException(409, code, message);
  }

  /**
   * Refus d'une règle métier : 403 FORBIDDEN si la personne n'en a pas le droit,
   * 409 INVALID_STATE si l'état de l'élément ne le permet pas.
   */
  static fromDecision(decision: { kind: "forbidden" | "state"; reason: string }): ApiException {
    return decision.kind === "forbidden"
      ? ApiException.forbidden(decision.reason)
      : ApiException.conflict("INVALID_STATE", decision.reason);
  }
}

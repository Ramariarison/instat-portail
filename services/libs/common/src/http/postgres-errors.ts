import { ApiException } from "./api.exception";

interface PostgresError {
  code?: string;
  detail?: string;
}

/** Erreurs PostgreSQL les plus courantes, traduites en réponses lisibles (null si ce n'en est pas une). */
export function fromPostgresError(error: unknown): ApiException | null {
  const { code, detail } = (error ?? {}) as PostgresError;
  switch (code) {
    case "23505":
      return ApiException.conflict("ALREADY_EXISTS", "Cette valeur est déjà utilisée par un autre élément.");
    case "23503":
      return detail?.includes("is still referenced")
        ? ApiException.conflict("IN_USE", "Cet élément est encore utilisé ailleurs : suppression impossible.")
        : ApiException.badRequest("Un élément référencé n'existe pas.", "INVALID_REFERENCE");
    case "23502":
    case "23514":
    case "22P02":
    case "22007":
    case "22008":
      return ApiException.badRequest("Une valeur envoyée n'est pas valide.");
    default:
      return null;
  }
}

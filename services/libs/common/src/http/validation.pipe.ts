import { type ValidationError, ValidationPipe } from "@nestjs/common";
import { ApiException } from "./api.exception";

function messages(errors: ValidationError[], parent = ""): string[] {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) => `${path} : ${message}`);
    return [...own, ...messages(error.children ?? [], path)];
  });
}

/**
 * Validation des DTO (class-validator) :
 * - les champs inconnus sont retirés sans erreur (whitelist), comme le faisait le front en mémoire ;
 * - les paramètres de requête sont convertis (« 20 » → 20) ;
 * - une requête invalide renvoie 400 VALIDATION_ERROR.
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => ApiException.badRequest(`Requête invalide : ${messages(errors).join(" ; ")}`),
  });
}

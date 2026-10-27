import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { TokenPayload } from "../token-payload";

/** Utilisateur du jeton, déposé sur la requête par AccessGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TokenPayload => context.switchToHttp().getRequest().user,
);

import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import type { FastifyRequest } from "fastify";
import { roles } from "../contract/contract.types";
import { can } from "../contract/permissions";
import { ApiException } from "../http/api.exception";
import { IS_PUBLIC } from "./decorators/public.decorator";
import { REQUIRED_PERMISSION, type RequiredPermission } from "./decorators/require-permission.decorator";
import type { TokenPayload } from "./token-payload";

/**
 * Garde globale de chaque service :
 * 1. route @Public() : ouverte ;
 * 2. sinon, jeton « Authorization: Bearer … » obligatoire et valide ;
 * 3. si la route porte @RequirePermission(), le rôle doit avoir ce droit.
 */
@Injectable()
export class AccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets)) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: TokenPayload }>();
    const user = await this.authenticate(request);
    request.user = user;

    const required = this.reflector.getAllAndOverride<RequiredPermission | undefined>(REQUIRED_PERMISSION, targets);
    if (required && !can(user.role, required.resource, required.action)) throw ApiException.forbidden();
    return true;
  }

  private async authenticate(request: FastifyRequest): Promise<TokenPayload> {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) throw new ApiException(401, "UNAUTHENTICATED", "Connexion requise.");

    try {
      const payload = await this.jwt.verifyAsync<TokenPayload>(token, { algorithms: ["HS256"] });
      if (typeof payload.sub !== "string" || !roles.includes(payload.role)) throw new Error("payload");
      return payload;
    } catch {
      throw new ApiException(401, "INVALID_TOKEN", "Session expirée ou invalide : reconnectez-vous.");
    }
  }
}

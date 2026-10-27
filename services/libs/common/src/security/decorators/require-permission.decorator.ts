import { SetMetadata } from "@nestjs/common";
import type { Action, Resource } from "../../contract/permissions";

export const REQUIRED_PERMISSION = "security:permission";

export interface RequiredPermission {
  resource: Resource;
  action: Action;
}

/** Exige un utilisateur connecté dont le rôle a ce droit dans la matrice RBAC (contract/permissions.ts). */
export const RequirePermission = (resource: Resource, action: Action) =>
  SetMetadata(REQUIRED_PERMISSION, { resource, action } satisfies RequiredPermission);

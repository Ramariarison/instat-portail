import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC = "security:isPublic";

/** Route ouverte sans connexion (contenus du site public, connexion elle-même). */
export const Public = () => SetMetadata(IS_PUBLIC, true);

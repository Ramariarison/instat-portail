import "reflect-metadata";
import { Logger, type Type } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AllExceptionsFilter } from "../http/all-exceptions.filter";
import { createValidationPipe } from "../http/validation.pipe";

export interface ServiceOptions {
  /** Nom du service (journaux, documentation). */
  name: string;
  /** Description affichée en tête de la documentation Swagger. */
  description: string;
  /** Module racine du service. */
  module: Type<unknown>;
  /** Réglages propres au service avant l'écoute (ex. : envoi de fichiers). */
  configure?: (app: NestFastifyApplication) => Promise<void> | void;
}

/**
 * Démarrage commun des services : Fastify comme moteur HTTP, validation des DTO, format d'erreur unique,
 * documentation OpenAPI sur /docs (via la passerelle : /api/docs/<service>/), arrêt propre sur SIGTERM.
 */
export async function bootstrapService(options: ServiceOptions): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    options.module,
    new FastifyAdapter({ trustProxy: true, bodyLimit: 2 * 1024 * 1024 }),
    { logger: ["log", "warn", "error"] },
  );

  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();
  await options.configure?.(app);

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`Portail INSTAT – service ${options.name}`)
      .setDescription(options.description)
      .setVersion("1.0")
      .addServer("/api", "Passerelle d'API")
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup("docs", app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, "0.0.0.0");
  Logger.log(`Service ${options.name} à l'écoute sur le port ${port}`, "Bootstrap");
}

import multipart from "@fastify/multipart";
import { bootstrapService } from "@app/common";
import { AppModule } from "./app.module";
import { filesConfig } from "./files/files.config";

void bootstrapService({
  name: "files",
  description: "Envoi et téléchargement des images et documents des publications.",
  module: AppModule,
  // Un seul fichier par envoi ; au-delà de la taille maximale, le fichier est tronqué puis refusé (413).
  configure: async (app) => {
    await app.register(multipart, { limits: { fileSize: filesConfig.maxBytes, files: 1, fields: 0 } });
  },
});

import { Module } from "@nestjs/common";
import { HealthModule, SecurityModule } from "@app/common";
import { FilesModule } from "./files/files.module";

/** Pas de base de données : les fichiers et leurs métadonnées sont sur un volume disque. */
@Module({
  imports: [SecurityModule, HealthModule.forService("files"), FilesModule],
})
export class AppModule {}

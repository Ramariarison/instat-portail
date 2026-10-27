import { bootstrapService } from "@app/common";
import { AppModule } from "./app.module";

void bootstrapService({
  name: "auth",
  description: "Connexion, jetons JWT et gestion des comptes (super administrateurs, administrateurs, éditeurs).",
  module: AppModule,
});

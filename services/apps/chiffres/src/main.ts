import { bootstrapService } from "@app/common";
import { AppModule } from "./app.module";

void bootstrapService({
  name: "chiffres",
  description: "« Madagascar en chiffres » : chiffres clés de l'accueil, types de données, indicateurs et valeurs par région.",
  module: AppModule,
});

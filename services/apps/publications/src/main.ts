import { bootstrapService } from "@app/common";
import { AppModule } from "./app.module";

void bootstrapService({
  name: "publications",
  description: "Thématiques, régions, secteurs, publications (site public et back-office) et actualités.",
  module: AppModule,
});

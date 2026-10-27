import path from "node:path";
import { Module } from "@nestjs/common";
import { DatabaseModule, HealthModule, SecurityModule } from "@app/common";
import { AuthModule } from "./auth/auth.module";
import { SeedModule } from "./seed/seed.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    DatabaseModule.forRoot({ migrationsDir: process.env.MIGRATIONS_DIR ?? path.resolve("apps/auth/migrations") }),
    SecurityModule,
    HealthModule.forService("auth"),
    AuthModule,
    UsersModule,
    SeedModule,
  ],
})
export class AppModule {}

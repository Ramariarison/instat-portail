import { Module } from "@nestjs/common";
import { PasswordModule } from "../password/password.module";
import { UsersModule } from "../users/users.module";
import { SeedService } from "./seed.service";

@Module({
  imports: [UsersModule, PasswordModule],
  providers: [SeedService],
})
export class SeedModule {}

import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { type AdminUser, CurrentUser, RequirePermission, type TokenPayload } from "@app/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@ApiTags("Comptes")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermission("users", "view")
  findAll(): Promise<AdminUser[]> {
    return this.users.findAll();
  }

  @Get(":id")
  @RequirePermission("users", "view")
  findOne(@Param("id") id: string): Promise<AdminUser> {
    return this.users.findOne(id);
  }

  @Post()
  @RequirePermission("users", "create")
  create(@Body() dto: CreateUserDto): Promise<AdminUser> {
    return this.users.create(dto);
  }

  @Patch(":id")
  @RequirePermission("users", "update")
  update(@Param("id") id: string, @Body() dto: UpdateUserDto, @CurrentUser() actor: TokenPayload): Promise<AdminUser> {
    return this.users.update(id, dto, actor);
  }

  @Delete(":id")
  @HttpCode(204)
  @RequirePermission("users", "delete")
  remove(@Param("id") id: string, @CurrentUser() actor: TokenPayload): Promise<void> {
    return this.users.remove(id, actor);
  }
}

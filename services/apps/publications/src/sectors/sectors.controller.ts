import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "@app/common";
import { sectors } from "./sectors.constants";

@ApiTags("Secteurs")
@Controller("sectors")
export class SectorsController {
  @Public()
  @Get()
  findAll(): typeof sectors {
    return sectors;
  }
}

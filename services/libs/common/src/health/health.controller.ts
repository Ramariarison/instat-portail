import { Controller, Get, Inject } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Public } from "../security/decorators/public.decorator";
import { SERVICE_NAME } from "./health.constants";

/** Sonde utilisée par Docker (HEALTHCHECK) : répond tant que le service tourne. */
@ApiExcludeController()
@Controller("health")
export class HealthController {
  constructor(@Inject(SERVICE_NAME) private readonly service: string) {}

  @Public()
  @Get()
  check(): { status: "ok"; service: string } {
    return { status: "ok", service: this.service };
  }
}

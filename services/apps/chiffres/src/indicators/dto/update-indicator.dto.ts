import { PartialType } from "@nestjs/swagger";
import { CreateIndicatorDefDto } from "./create-indicator.dto";

export class UpdateIndicatorDefDto extends PartialType(CreateIndicatorDefDto) {}

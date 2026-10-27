import { PartialType } from "@nestjs/swagger";
import { CreateThematiqueDto } from "./create-thematique.dto";

export class UpdateThematiqueDto extends PartialType(CreateThematiqueDto) {}

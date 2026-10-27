import { PartialType } from "@nestjs/swagger";
import { CreateKeyFigureDto } from "./create-key-figure.dto";

export class UpdateKeyFigureDto extends PartialType(CreateKeyFigureDto) {}

import { PartialType } from "@nestjs/swagger";
import { CreateFigureValueDto } from "./create-figure-value.dto";

export class UpdateFigureValueDto extends PartialType(CreateFigureValueDto) {}

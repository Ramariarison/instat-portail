import { PartialType } from "@nestjs/swagger";
import { CreateFigureRegionDto } from "./create-figure-region.dto";

export class UpdateFigureRegionDto extends PartialType(CreateFigureRegionDto) {}

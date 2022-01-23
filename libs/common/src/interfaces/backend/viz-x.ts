import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Viz } from '../blockml/viz';
import { ReportX } from './report-x';

export class VizX extends Viz {
  @ValidateNested()
  @Type(() => ReportX)
  reports: ReportX[];

  @IsString()
  author: string;

  @IsBoolean()
  canEditOrDeleteViz: boolean;
}

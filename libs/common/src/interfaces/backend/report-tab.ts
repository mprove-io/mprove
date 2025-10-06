import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MconfigChart } from '../blockml/mconfig-chart';
import { ReportField } from '../blockml/report-field';
import { Row } from '../blockml/row';

export class ReportTab {
  @IsString()
  filePath: string;

  @IsString({ each: true })
  accessRoles: string[];

  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => ReportField)
  fields: ReportField[];

  @ValidateNested()
  @Type(() => Row)
  rows: Row[];

  @ValidateNested()
  @Type(() => MconfigChart)
  chart: MconfigChart;
}

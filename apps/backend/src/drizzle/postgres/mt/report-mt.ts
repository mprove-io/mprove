import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { Row } from '~common/interfaces/blockml/row';
import { ReportEnt } from '../schema/reports';

export interface ReportMt extends Omit<ReportEnt, 'st' | 'lt'> {
  st: ReportSt;
  lt: ReportLt;
}

export class ReportSt {
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
  @Type(() => MconfigChart)
  chart: MconfigChart;
}

export class ReportLt {
  @ValidateNested()
  @Type(() => Row)
  rows: Row[];
}

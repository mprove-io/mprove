import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { RunReportRow } from '#common/interfaces/backend/run/run-report-row';

export class RunReport {
  @IsString()
  title: string;

  @IsString()
  reportId: string;

  @IsString()
  url: string;

  @ValidateNested()
  @Type(() => RunReportRow)
  rows: RunReportRow[];
}

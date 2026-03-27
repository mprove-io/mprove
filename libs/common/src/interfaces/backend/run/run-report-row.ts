import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { RunQuery } from '#common/interfaces/backend/run/run-query';

export class RunReportRow {
  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => RunQuery)
  query: RunQuery;
}

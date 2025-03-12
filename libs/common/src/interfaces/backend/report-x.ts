import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Report } from '../blockml/report';
import { FilterX } from './filter-x';

export class ReportX extends Report {
  @ValidateNested()
  @Type(() => FilterX)
  extendedFilters: FilterX[];

  @IsString()
  author: string;

  @IsBoolean()
  canEditOrDeleteReport: boolean;

  @IsString()
  metricsStartDateYYYYMMDD: string;

  @IsString()
  metricsEndDateExcludedYYYYMMDD: string;

  @IsString()
  metricsEndDateIncludedYYYYMMDD: string;
}

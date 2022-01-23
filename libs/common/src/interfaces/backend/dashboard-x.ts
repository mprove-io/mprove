import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Dashboard } from '../blockml/dashboard';
import { FilterX } from './filter-x';
import { ReportX } from './report-x';

export class DashboardX extends Dashboard {
  @ValidateNested()
  @Type(() => FilterX)
  extendedFilters: FilterX[];

  @ValidateNested()
  @Type(() => ReportX)
  reports: ReportX[];

  @IsString()
  author: string;

  @IsBoolean()
  canEditOrDeleteDashboard: boolean;
}

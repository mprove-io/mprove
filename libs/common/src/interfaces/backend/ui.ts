import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ModelTreeLevelsEnum } from '#common/enums/model-tree-levels-enum.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { IsTimezone } from '#common/functions/is-timezone';
import { Fraction } from '../blockml/fraction';
import { ProjectChartLink } from './project-chart-link';
import { ProjectDashboardLink } from './project-dashboard-link';
import { ProjectModelLink } from './project-model-link';
import { ProjectReportLink } from './project-report-link';
import { ProjectSessionLink } from './project-session-link';

export class Ui {
  @IsEnum(ModelTreeLevelsEnum)
  modelTreeLevels: ModelTreeLevelsEnum;

  @IsTimezone()
  timezone: string;

  @IsEnum(TimeSpecEnum)
  timeSpec: TimeSpecEnum;

  @ValidateNested()
  @Type(() => Fraction)
  timeRangeFraction: Fraction;

  @ValidateNested()
  @Type(() => ProjectSessionLink)
  projectSessionLinks: ProjectSessionLink[];

  @ValidateNested()
  @Type(() => ProjectModelLink)
  projectModelLinks: ProjectModelLink[];

  @ValidateNested()
  @Type(() => ProjectChartLink)
  projectChartLinks: ProjectChartLink[];

  @ValidateNested()
  @Type(() => ProjectDashboardLink)
  projectDashboardLinks: ProjectDashboardLink[];

  @ValidateNested()
  @Type(() => ProjectReportLink)
  projectReportLinks: ProjectReportLink[];

  @IsOptional()
  @IsString()
  lastSelectedProviderModel?: string;

  @IsOptional()
  @IsString()
  lastSelectedVariant?: string;
}

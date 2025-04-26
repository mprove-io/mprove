import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { IsTimezone } from '~common/functions/is-timezone';
import { Fraction } from '../blockml/fraction';
import { ProjectChartLink } from './project-chart-link';
import { ProjectDashboardLink } from './project-dashboard-link';
import { ProjectFileLink } from './project-file-link';
import { ProjectModelLink } from './project-model-link';
import { ProjectReportLink } from './project-report-link';

export class Ui {
  @IsInt()
  metricsColumnNameWidth: number;

  @IsInt()
  metricsTimeColumnsNarrowWidth: number;

  @IsInt()
  metricsTimeColumnsWideWidth: number;

  @IsBoolean()
  showMetricsModelName: boolean;

  @IsBoolean()
  showMetricsTimeFieldName: boolean;

  @IsBoolean()
  showMetricsChart: boolean;

  @IsBoolean()
  showMetricsChartSettings: boolean;

  @IsBoolean()
  showHours: boolean;

  @IsBoolean()
  isAutoRun: boolean;

  @ValidateNested()
  @Type(() => ProjectFileLink)
  projectFileLinks: ProjectFileLink[];

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

  @IsBoolean()
  showMetricsParameters: boolean;

  @IsEnum(enums.ModelTreeLevelsEnum)
  modelTreeLevels: enums.ModelTreeLevelsEnum;

  @IsTimezone()
  timezone: string;

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @ValidateNested()
  @Type(() => Fraction)
  timeRangeFraction: Fraction;
}

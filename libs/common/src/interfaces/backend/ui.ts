import { Type } from 'class-transformer';
import { IsEnum, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { IsTimezone } from '~common/functions/is-timezone';
import { Fraction } from '../blockml/fraction';
import { ProjectChartLink } from './project-chart-link';
import { ProjectDashboardLink } from './project-dashboard-link';
import { ProjectFileLink } from './project-file-link';
import { ProjectModelLink } from './project-model-link';
import { ProjectReportLink } from './project-report-link';

export class Ui {
  @IsEnum(enums.ModelTreeLevelsEnum)
  modelTreeLevels: enums.ModelTreeLevelsEnum;

  @IsTimezone()
  timezone: string;

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @ValidateNested()
  @Type(() => Fraction)
  timeRangeFraction: Fraction;

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
}

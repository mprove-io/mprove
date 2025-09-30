import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { IsTimezone } from '~common/functions/is-timezone';

export class MproveConfig {
  @IsString()
  mproveDirValue: string;

  @IsBoolean()
  caseSensitiveStringFilters: boolean;

  @IsEnum(ProjectWeekStartEnum)
  weekStart: ProjectWeekStartEnum;

  @IsBoolean()
  allowTimezones: boolean;

  @IsTimezone()
  defaultTimezone: string;

  @IsString()
  formatNumber: string;

  @IsString()
  currencyPrefix: string;

  @IsString()
  currencySuffix: string;

  @IsString()
  thousandsSeparator: string;
}

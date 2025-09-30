import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { IsTimezone } from '~common/functions/is-timezone';

export class MproveConfig {
  @IsOptional()
  @IsString()
  mproveDirValue: string;

  @IsOptional()
  @IsBoolean()
  caseSensitiveStringFilters: boolean;

  @IsOptional()
  @IsEnum(ProjectWeekStartEnum)
  weekStart: ProjectWeekStartEnum;

  @IsOptional()
  @IsBoolean()
  allowTimezones: boolean;

  @IsOptional()
  @IsTimezone()
  defaultTimezone: string;

  @IsOptional()
  @IsString()
  formatNumber: string;

  @IsOptional()
  @IsString()
  currencyPrefix: string;

  @IsOptional()
  @IsString()
  currencySuffix: string;

  @IsOptional()
  @IsString()
  thousandsSeparator: string;
}

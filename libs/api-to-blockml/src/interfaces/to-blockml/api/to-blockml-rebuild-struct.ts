import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlRequest } from '~api-to-blockml/interfaces/to-blockml/to-blockml-request';
import { IsTimezone } from '~common/functions/is-timezone';

export class ToBlockmlRebuildStructRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @ValidateNested()
  @Type(() => common.Ev)
  evs: common.Ev[];

  @IsString()
  structId: string;

  @IsOptional()
  @IsString()
  mproveDir: string; // IsOptional is only for validator, not for type checks

  @ValidateNested()
  @Type(() => common.BmlFile)
  files: common.BmlFile[];

  @ValidateNested()
  @Type(() => common.ProjectConnection)
  connections: common.ProjectConnection[];

  @IsOptional()
  @IsString()
  overrideTimezone: string;
}

export class ToBlockmlRebuildStructRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructRequestPayload)
  payload: ToBlockmlRebuildStructRequestPayload;
}

export class ToBlockmlRebuildStructResponsePayload {
  @IsString()
  mproveDirValue: string;

  @IsEnum(common.ProjectWeekStartEnum)
  weekStart: common.ProjectWeekStartEnum;

  @IsTimezone()
  defaultTimezone: string;

  @IsBoolean()
  allowTimezones: boolean;

  @IsString()
  formatNumber: string;

  @IsString()
  currencyPrefix: string;

  @IsString()
  currencySuffix: string;

  @IsString()
  thousandsSeparator: string;

  @IsBoolean()
  caseSensitiveStringFilters: boolean;

  @IsBoolean()
  simplifySafeAggregates: boolean;

  @ValidateNested()
  @Type(() => common.BmlError)
  errors: common.BmlError[];

  @ValidateNested()
  @Type(() => common.Model)
  models: common.Model[];

  @ValidateNested()
  @Type(() => common.Dashboard)
  dashboards: common.Dashboard[];

  @ValidateNested()
  @Type(() => common.Report)
  reports: common.Report[];

  @ValidateNested()
  @Type(() => common.Chart)
  charts: common.Chart[];

  @ValidateNested()
  @Type(() => common.ModelMetric)
  metrics: common.ModelMetric[];

  @ValidateNested()
  @Type(() => common.Preset)
  presets: common.Preset[];

  @ValidateNested()
  @Type(() => common.Mconfig)
  mconfigs: common.Mconfig[];

  @ValidateNested()
  @Type(() => common.Query)
  queries: common.Query[];
}

export class ToBlockmlRebuildStructResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructResponsePayload)
  payload: ToBlockmlRebuildStructResponsePayload;
}

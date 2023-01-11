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

export class ToBlockmlRebuildStructRequestPayload {
  @IsString()
  orgId: string;

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

  @IsString()
  defaultTimezone: string;

  @IsBoolean()
  allowTimezones: boolean;

  @IsString()
  formatNumber: string;

  @IsString()
  currencyPrefix: string;

  @IsString()
  currencySuffix: string;

  @ValidateNested()
  @Type(() => common.BmlError)
  errors: common.BmlError[];

  @ValidateNested()
  @Type(() => common.UdfsDict)
  udfsDict: common.UdfsDict;

  @ValidateNested()
  @Type(() => common.View)
  views: common.View[];

  @ValidateNested()
  @Type(() => common.Model)
  models: common.Model[];

  @ValidateNested()
  @Type(() => common.Dashboard)
  dashboards: common.Dashboard[];

  @ValidateNested()
  @Type(() => common.Viz)
  vizs: common.Viz[];

  metrics: common.MetricAny[];

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

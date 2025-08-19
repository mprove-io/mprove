import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { IsTimezone } from '~common/functions/is-timezone';
import { Ev } from '~common/interfaces/backend/ev';
import { BmlError } from '~common/interfaces/blockml/bml-error';
import { BmlFile } from '~common/interfaces/blockml/bml-file';
import { Chart } from '~common/interfaces/blockml/chart';
import { Dashboard } from '~common/interfaces/blockml/dashboard';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Model } from '~common/interfaces/blockml/model';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';
import { Preset } from '~common/interfaces/blockml/preset';
import { ProjectConnection } from '~common/interfaces/blockml/project-connection';
import { Query } from '~common/interfaces/blockml/query';
import { Report } from '~common/interfaces/blockml/report';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBlockmlRequest } from '../to-blockml-request';

export class ToBlockmlRebuildStructRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @ValidateNested()
  @Type(() => Ev)
  evs: Ev[];

  @IsString()
  structId: string;

  @IsOptional()
  @IsString()
  mproveDir: string; // IsOptional is only for validator, not for type checks

  @ValidateNested()
  @Type(() => BmlFile)
  files: BmlFile[];

  @ValidateNested()
  @Type(() => ProjectConnection)
  connections: ProjectConnection[];

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

  @IsEnum(ProjectWeekStartEnum)
  weekStart: ProjectWeekStartEnum;

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
  @Type(() => BmlError)
  errors: BmlError[];

  @ValidateNested()
  @Type(() => Model)
  models: Model[];

  @ValidateNested()
  @Type(() => Dashboard)
  dashboards: Dashboard[];

  @ValidateNested()
  @Type(() => Report)
  reports: Report[];

  @ValidateNested()
  @Type(() => Chart)
  charts: Chart[];

  @ValidateNested()
  @Type(() => ModelMetric)
  metrics: ModelMetric[];

  @ValidateNested()
  @Type(() => Preset)
  presets: Preset[];

  @ValidateNested()
  @Type(() => Mconfig)
  mconfigs: Mconfig[];

  @ValidateNested()
  @Type(() => Query)
  queries: Query[];
}

export class ToBlockmlRebuildStructResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructResponsePayload)
  payload: ToBlockmlRebuildStructResponsePayload;
}

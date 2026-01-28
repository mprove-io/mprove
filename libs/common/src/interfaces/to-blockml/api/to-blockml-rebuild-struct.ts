import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { BaseConnection } from '#common/interfaces/backend/base-connection';
import { Ev } from '#common/interfaces/backend/ev';
import { MproveConfig } from '#common/interfaces/backend/mprove-config';
import { BmlError } from '#common/interfaces/blockml/bml-error';
import { BmlFile } from '#common/interfaces/blockml/bml-file';
import { Chart } from '#common/interfaces/blockml/chart';
import { Dashboard } from '#common/interfaces/blockml/dashboard';
import { Mconfig } from '#common/interfaces/blockml/mconfig';
import { Model } from '#common/interfaces/blockml/model';
import { ModelMetric } from '#common/interfaces/blockml/model-metric';
import { Preset } from '#common/interfaces/blockml/preset';
import { Query } from '#common/interfaces/blockml/query';
import { Report } from '#common/interfaces/blockml/report';
import { MyResponse } from '#common/interfaces/to/my-response';
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
  mproveDir: string;

  @ValidateNested()
  @Type(() => BmlFile)
  files: BmlFile[];

  @ValidateNested()
  @Type(() => BaseConnection)
  baseConnections: BaseConnection[];

  @IsOptional()
  @IsString()
  overrideTimezone: string;

  @IsBoolean()
  isUseCache: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => MproveConfig)
  cachedMproveConfig: MproveConfig;

  @ValidateNested()
  @Type(() => Model)
  cachedModels: Model[];

  @ValidateNested()
  @Type(() => ModelMetric)
  cachedMetrics: ModelMetric[];
}

export class ToBlockmlRebuildStructRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructRequestPayload)
  payload: ToBlockmlRebuildStructRequestPayload;
}

export class ToBlockmlRebuildStructResponsePayload {
  @ValidateNested()
  @Type(() => MproveConfig)
  mproveConfig: MproveConfig;

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

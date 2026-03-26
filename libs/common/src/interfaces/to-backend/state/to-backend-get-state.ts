import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { StateChartItem } from '#common/interfaces/backend/state/state-chart-item';
import { StateDashboardItem } from '#common/interfaces/backend/state/state-dashboard-item';
import { StateErrorItem } from '#common/interfaces/backend/state/state-error-item';
import { StateMetricItem } from '#common/interfaces/backend/state/state-metric-item';
import { StateModelItem } from '#common/interfaces/backend/state/state-model-item';
import { StateReportItem } from '#common/interfaces/backend/state/state-report-item';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetStateRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsBoolean()
  isFetch: boolean;

  @IsBoolean()
  getErrors: boolean;

  @IsBoolean()
  getRepo: boolean;

  @IsBoolean()
  getRepoNodes: boolean;

  @IsBoolean()
  getModels: boolean;

  @IsBoolean()
  getDashboards: boolean;

  @IsBoolean()
  getCharts: boolean;

  @IsBoolean()
  getMetrics: boolean;

  @IsBoolean()
  getReports: boolean;
}

export class ToBackendGetStateRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetStateRequestPayload)
  payload: ToBackendGetStateRequestPayload;
}

export class ToBackendGetStateResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @IsString()
  structId: string;

  @IsInt()
  validationErrorsTotal: number;

  @IsInt()
  modelsTotal: number;

  @IsInt()
  chartsTotal: number;

  @IsInt()
  dashboardsTotal: number;

  @IsInt()
  reportsTotal: number;

  @IsString()
  builderUrl: string;

  @ValidateNested()
  @Type(() => StateErrorItem)
  validationErrors: StateErrorItem[];

  @ValidateNested()
  @Type(() => StateModelItem)
  modelItems: StateModelItem[];

  @ValidateNested()
  @Type(() => StateChartItem)
  chartItems: StateChartItem[];

  @ValidateNested()
  @Type(() => StateDashboardItem)
  dashboardItems: StateDashboardItem[];

  @ValidateNested()
  @Type(() => StateReportItem)
  reportItems: StateReportItem[];

  @ValidateNested()
  @Type(() => StateMetricItem)
  metricItems: StateMetricItem[];

  @IsOptional()
  @ValidateNested()
  @Type(() => Repo)
  repo?: Repo;
}

export class ToBackendGetStateResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetStateResponsePayload)
  payload: ToBackendGetStateResponsePayload;
}

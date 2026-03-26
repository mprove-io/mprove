import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';
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

  @IsString()
  defaultTimezone: string;

  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @IsInt()
  errorsTotal: number;

  @ValidateNested()
  @Type(() => StateErrorItem)
  errors: StateErrorItem[];

  @IsInt()
  modelsTotal: number;

  @ValidateNested()
  @Type(() => StateModelItem)
  models: StateModelItem[];

  @IsInt()
  chartsTotal: number;

  @ValidateNested()
  @Type(() => StateChartItem)
  charts: StateChartItem[];

  @IsInt()
  dashboardsTotal: number;

  @ValidateNested()
  @Type(() => StateDashboardItem)
  dashboards: StateDashboardItem[];

  @IsInt()
  reportsTotal: number;

  @ValidateNested()
  @Type(() => StateReportItem)
  reports: StateReportItem[];

  @ValidateNested()
  @Type(() => StateMetricItem)
  metrics: StateMetricItem[];

  @IsString()
  builderUrl: string;
}

export class ToBackendGetStateResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetStateResponsePayload)
  payload: ToBackendGetStateResponsePayload;
}

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested
} from 'class-validator';
import { McliQueriesStats } from '#common/interfaces/mcli/mcli-queries-stats';
import { MyResponse } from '#common/interfaces/to/my-response';
import { RunChart } from '#common/interfaces/to-backend/run/run-chart';
import { RunDashboard } from '#common/interfaces/to-backend/run/run-dashboard';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendRunRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  concurrency?: number;

  @IsBoolean()
  wait: boolean;

  @IsOptional()
  @IsNumber()
  sleep?: number;

  @IsOptional()
  @IsString()
  dashboardIds?: string;

  @IsOptional()
  @IsString()
  chartIds?: string;

  @IsBoolean()
  noDashboards: boolean;

  @IsBoolean()
  noCharts: boolean;
}

export class ToBackendRunRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRunRequestPayload)
  payload: ToBackendRunRequestPayload;
}

export class ToBackendRunResponsePayload {
  @ValidateNested()
  @Type(() => RunChart)
  charts: RunChart[];

  @ValidateNested()
  @Type(() => RunDashboard)
  dashboards: RunDashboard[];

  queriesStats: McliQueriesStats;
}

export class ToBackendRunResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRunResponsePayload)
  payload: ToBackendRunResponsePayload;
}

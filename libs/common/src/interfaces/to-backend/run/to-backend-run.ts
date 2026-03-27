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
import { RunChart } from '#common/interfaces/backend/run/run-chart';
import { RunDashboard } from '#common/interfaces/backend/run/run-dashboard';
import { RunReport } from '#common/interfaces/backend/run/run-report';
import { McliQueriesStats } from '#common/interfaces/mcli/mcli-queries-stats';
import { MyResponse } from '#common/interfaces/to/my-response';
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

  @IsBoolean()
  getDashboards: boolean;

  @IsBoolean()
  getCharts: boolean;

  @IsOptional()
  @IsString()
  reportIds?: string;

  @IsBoolean()
  noReports: boolean;

  @IsBoolean()
  getReports: boolean;
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

  @ValidateNested()
  @Type(() => RunChart)
  errorCharts: RunChart[];

  @ValidateNested()
  @Type(() => RunDashboard)
  errorDashboards: RunDashboard[];

  @ValidateNested()
  @Type(() => RunReport)
  reports: RunReport[];

  @ValidateNested()
  @Type(() => RunReport)
  errorReports: RunReport[];

  queriesStats: McliQueriesStats;
}

export class ToBackendRunResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRunResponsePayload)
  payload: ToBackendRunResponsePayload;
}

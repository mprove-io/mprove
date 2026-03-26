import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { IsTimezone } from '#common/functions/is-timezone';
import { QueryInfoChart } from '#common/interfaces/backend/query-info/query-info-chart';
import { QueryInfoDashboard } from '#common/interfaces/backend/query-info/query-info-dashboard';
import { QueryInfoReport } from '#common/interfaces/backend/query-info/query-info-report';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetQueryInfoRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsOptional()
  @IsString()
  chartId: string;

  @IsOptional()
  @IsString()
  dashboardId: string;

  @IsOptional()
  @IsInt()
  tileIndex: number;

  @IsOptional()
  @IsString()
  reportId: string;

  @IsOptional()
  @IsString()
  rowId: string;

  @IsTimezone()
  timezone: string;

  @IsOptional()
  @IsEnum(TimeSpecEnum)
  timeSpec: TimeSpecEnum;

  @IsOptional()
  @IsString()
  timeRangeFractionBrick: string;

  @IsBoolean()
  getMalloy: boolean;

  @IsBoolean()
  getSql: boolean;

  @IsBoolean()
  getData: boolean;

  @IsBoolean()
  isFetch: boolean;
}

export class ToBackendGetQueryInfoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetQueryInfoRequestPayload)
  payload: ToBackendGetQueryInfoRequestPayload;
}

export class ToBackendGetQueryInfoResponsePayload {
  @IsOptional()
  @ValidateNested()
  @Type(() => QueryInfoChart)
  chart: QueryInfoChart;

  @IsOptional()
  @ValidateNested()
  @Type(() => QueryInfoDashboard)
  dashboard: QueryInfoDashboard;

  @IsOptional()
  @ValidateNested()
  @Type(() => QueryInfoReport)
  report: QueryInfoReport;
}

export class ToBackendGetQueryInfoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetQueryInfoResponsePayload)
  payload: ToBackendGetQueryInfoResponsePayload;
}

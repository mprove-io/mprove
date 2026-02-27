import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { QueryOperation } from '#common/interfaces/backend/query-operation';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateDraftChartRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @ValidateNested()
  @Type(() => MconfigX)
  mconfig: MconfigX;

  @IsOptional()
  @IsBoolean()
  isKeepQueryId: boolean;

  @IsOptional()
  @IsNumber()
  cellMetricsStartDateMs: number;

  @IsOptional()
  @IsNumber()
  cellMetricsEndDateMs: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => QueryOperation)
  queryOperation: QueryOperation;
}

export class ToBackendCreateDraftChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftChartRequestPayload)
  payload: ToBackendCreateDraftChartRequestPayload;
}

export class ToBackendCreateDraftChartResponsePayload {
  @ValidateNested()
  @Type(() => ChartX)
  chart: ChartX;
}

export class ToBackendCreateDraftChartResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftChartResponsePayload)
  payload: ToBackendCreateDraftChartResponsePayload;
}

import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { IsTimezone } from '#common/functions/is-timezone';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { Query } from '#common/interfaces/blockml/query';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGroupMetricByDimensionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsTimezone()
  timezone: string;

  @IsString()
  mconfigId: string;

  @IsString()
  groupByFieldId: string;

  @IsOptional()
  @IsNumber()
  cellMetricsStartDateMs: number;

  @IsOptional()
  @IsNumber()
  cellMetricsEndDateMs: number;
}

export class ToBackendGroupMetricByDimensionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGroupMetricByDimensionRequestPayload)
  payload: ToBackendGroupMetricByDimensionRequestPayload;
}

export class ToBackendGroupMetricByDimensionResponsePayload {
  @ValidateNested()
  @Type(() => MconfigX)
  mconfig: MconfigX;

  @ValidateNested()
  @Type(() => Query)
  query: Query;
}

export class ToBackendGroupMetricByDimensionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGroupMetricByDimensionResponsePayload)
  payload: ToBackendGroupMetricByDimensionResponsePayload;
}

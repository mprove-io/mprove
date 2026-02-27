import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { Query } from '#common/interfaces/blockml/query';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSuggestDimensionValuesRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  structId: string;

  @IsString()
  modelId: string;

  @IsString()
  fieldId: string;

  @IsOptional()
  @IsString()
  chartId: string;

  @IsOptional()
  @IsString()
  dashboardId: string;

  @IsOptional()
  @IsString()
  reportId: string;

  @IsOptional()
  @IsString()
  rowId: string;

  @IsOptional()
  @IsString()
  term: string;

  @IsOptional()
  @IsNumber()
  cellMetricsStartDateMs: number;

  @IsOptional()
  @IsNumber()
  cellMetricsEndDateMs: number;
}

export class ToBackendSuggestDimensionValuesRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSuggestDimensionValuesRequestPayload)
  payload: ToBackendSuggestDimensionValuesRequestPayload;
}

export class ToBackendSuggestDimensionValuesResponsePayload {
  @ValidateNested()
  @Type(() => MconfigX)
  mconfig: MconfigX;

  @ValidateNested()
  @Type(() => Query)
  query: Query;
}

export class ToBackendSuggestDimensionValuesResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSuggestDimensionValuesResponsePayload)
  payload: ToBackendSuggestDimensionValuesResponsePayload;
}

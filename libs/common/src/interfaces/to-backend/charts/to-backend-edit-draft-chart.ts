import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { QueryOperation } from '#common/interfaces/backend/query-operation';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendEditDraftChartRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  chartId: string;

  @ValidateNested()
  @Type(() => MconfigX)
  mconfig: MconfigX;

  @IsOptional()
  @ValidateNested()
  @Type(() => QueryOperation)
  queryOperation: QueryOperation;
}

export class ToBackendEditDraftChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditDraftChartRequestPayload)
  payload: ToBackendEditDraftChartRequestPayload;
}

export class ToBackendEditDraftChartResponsePayload {
  @ValidateNested()
  @Type(() => ChartX)
  chart: ChartX;
}

export class ToBackendEditDraftChartResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditDraftChartResponsePayload)
  payload: ToBackendEditDraftChartResponsePayload;
}

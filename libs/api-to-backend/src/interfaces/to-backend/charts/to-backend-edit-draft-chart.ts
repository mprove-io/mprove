import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendEditDraftChartRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @ValidateNested()
  @Type(() => common.MconfigX)
  mconfig: common.MconfigX;

  // @IsOptional()
  // @IsNumber()
  // cellMetricsStartDateMs: number;

  // @IsOptional()
  // @IsNumber()
  // cellMetricsEndDateMs: number;
}

export class ToBackendEditDraftChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditDraftChartRequestPayload)
  payload: ToBackendEditDraftChartRequestPayload;
}

export class ToBackendEditDraftChartResponsePayload {
  @ValidateNested()
  @Type(() => common.ChartX)
  chart: common.ChartX;
}

export class ToBackendEditDraftChartResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditDraftChartResponsePayload)
  payload: ToBackendEditDraftChartResponsePayload;
}

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateDraftChartRequestPayload {
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

  @IsOptional()
  @IsNumber()
  cellMetricsStartDateMs: number;

  @IsOptional()
  @IsNumber()
  cellMetricsEndDateMs: number;
}

export class ToBackendCreateDraftChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftChartRequestPayload)
  payload: ToBackendCreateDraftChartRequestPayload;
}

export class ToBackendCreateDraftChartResponsePayload {
  @ValidateNested()
  @Type(() => common.ChartX)
  chart: common.ChartX;
}

export class ToBackendCreateDraftChartResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftChartResponsePayload)
  payload: ToBackendCreateDraftChartResponsePayload;
}

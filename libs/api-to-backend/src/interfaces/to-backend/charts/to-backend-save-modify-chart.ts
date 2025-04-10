import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSaveModifyChartRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  chartId: string;

  @IsString()
  tileTitle: string;

  @IsOptional()
  @IsString()
  accessRoles?: string;

  @IsOptional()
  @IsString()
  accessUsers?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => common.MconfigX)
  mconfig: common.MconfigX;
}

export class ToBackendSaveModifyChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyChartRequestPayload)
  payload: ToBackendSaveModifyChartRequestPayload;
}

export class ToBackendSaveModifyChartResponsePayload {
  @ValidateNested()
  @Type(() => common.ChartX)
  chart: common.ChartX;

  @ValidateNested()
  @Type(() => common.ChartX)
  chartPart: common.ChartX;
}

export class ToBackendSaveModifyChartResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyChartResponsePayload)
  payload: ToBackendSaveModifyChartResponsePayload;
}

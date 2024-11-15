import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateChartRequestPayload {
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

  @ValidateNested()
  @Type(() => common.MconfigX)
  mconfig: common.MconfigX;
}

export class ToBackendCreateChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateChartRequestPayload)
  payload: ToBackendCreateChartRequestPayload;
}

export class ToBackendCreateChartResponsePayload {
  @ValidateNested()
  @Type(() => common.ChartX)
  viz: common.ChartX;
}

export class ToBackendCreateChartResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateChartResponsePayload)
  payload: ToBackendCreateChartResponsePayload;
}

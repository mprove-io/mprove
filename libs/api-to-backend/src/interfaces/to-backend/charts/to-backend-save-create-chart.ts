import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSaveCreateChartRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  fromChartId: string;

  @IsString()
  newChartId: string;

  @IsString()
  tileTitle: string;

  @IsOptional()
  @IsString()
  accessRoles?: string;

  @ValidateNested()
  @Type(() => common.MconfigX)
  mconfig: common.MconfigX;
}

export class ToBackendSaveCreateChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateChartRequestPayload)
  payload: ToBackendSaveCreateChartRequestPayload;
}

export class ToBackendSaveCreateChartResponsePayload {
  @ValidateNested()
  @Type(() => common.ChartX)
  chart: common.ChartX;
}

export class ToBackendSaveCreateChartResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateChartResponsePayload)
  payload: ToBackendSaveCreateChartResponsePayload;
}

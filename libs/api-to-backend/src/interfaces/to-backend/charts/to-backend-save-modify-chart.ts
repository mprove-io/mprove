import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';
import { IsTimezone } from '~common/functions/is-timezone';

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
  fromChartId: string;

  @IsString()
  chartId: string;

  @IsString()
  tileTitle: string;

  @IsTimezone()
  timezone: string;

  @IsOptional()
  @IsString()
  accessRoles?: string;
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

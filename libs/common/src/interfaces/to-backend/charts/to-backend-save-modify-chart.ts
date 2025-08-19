import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';

import { IsTimezone } from '~common/functions/is-timezone';
import { ChartX } from '~common/interfaces/backend/chart-x';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => ChartX)
  chart: ChartX;

  @ValidateNested()
  @Type(() => ChartX)
  chartPart: ChartX;
}

export class ToBackendSaveModifyChartResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyChartResponsePayload)
  payload: ToBackendSaveModifyChartResponsePayload;
}

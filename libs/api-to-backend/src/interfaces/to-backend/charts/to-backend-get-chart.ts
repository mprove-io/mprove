import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetChartRequestPayload {
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
}

export class ToBackendGetChartRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetChartRequestPayload)
  payload: ToBackendGetChartRequestPayload;
}

export class ToBackendGetChartResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.ChartX)
  viz: common.ChartX;
}

export class ToBackendGetChartResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetChartResponsePayload)
  payload: ToBackendGetChartResponsePayload;
}

import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetDashboardsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;
}

export class ToBackendGetDashboardsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardsRequestPayload)
  payload: ToBackendGetDashboardsRequestPayload;
}

export class ToBackendGetDashboardsResponsePayload {
  @ValidateNested()
  @Type(() => common.Dashboard)
  dashboards: common.Dashboard[];
}

export class ToBackendGetDashboardsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardsResponsePayload)
  payload: ToBackendGetDashboardsResponsePayload;
}

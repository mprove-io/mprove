import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetDashboardsListRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendGetDashboardsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardsListRequestPayload)
  payload: ToBackendGetDashboardsListRequestPayload;
}

export class ToBackendGetDashboardsListResponsePayload {
  @ValidateNested()
  @Type(() => common.DashboardsItem)
  dashboardsList: common.DashboardsItem[];
}

export class ToBackendGetDashboardsListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardsListResponsePayload)
  payload: ToBackendGetDashboardsListResponsePayload;
}

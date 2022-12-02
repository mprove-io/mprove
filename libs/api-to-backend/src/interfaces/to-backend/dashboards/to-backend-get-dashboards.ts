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

  @IsString()
  envId: string;
}

export class ToBackendGetDashboardsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardsRequestPayload)
  payload: ToBackendGetDashboardsRequestPayload;
}

export class ToBackendGetDashboardsResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.ModelX)
  models: common.ModelX[];

  @ValidateNested()
  @Type(() => common.DashboardX)
  dashboards: common.DashboardX[];
}

export class ToBackendGetDashboardsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardsResponsePayload)
  payload: ToBackendGetDashboardsResponsePayload;
}

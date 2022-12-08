import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  dashboardId: string;
}

export class ToBackendGetDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardRequestPayload)
  payload: ToBackendGetDashboardRequestPayload;
}

export class ToBackendGetDashboardResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.DashboardX)
  dashboard: common.DashboardX;
}

export class ToBackendGetDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardResponsePayload)
  payload: ToBackendGetDashboardResponsePayload;
}

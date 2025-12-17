import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { IsTimezone } from '~common/functions/is-timezone';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { Member } from '~common/interfaces/backend/member';
import { StructX } from '~common/interfaces/backend/struct-x';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

  @IsTimezone()
  timezone: string;
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
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => DashboardX)
  dashboard: DashboardX;
}

export class ToBackendGetDashboardResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardResponsePayload)
  payload: ToBackendGetDashboardResponsePayload;
}

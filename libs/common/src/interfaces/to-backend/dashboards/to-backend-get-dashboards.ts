import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { DashboardPart } from '~common/interfaces/backend/dashboard-part';
import { Member } from '~common/interfaces/backend/member';
import { ModelX } from '~common/interfaces/backend/model-x';
import { StructX } from '~common/interfaces/backend/struct-x';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => ModelX)
  models: ModelX[];

  @ValidateNested()
  @Type(() => DashboardPart)
  dashboardParts: DashboardPart[];
}

export class ToBackendGetDashboardsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardsResponsePayload)
  payload: ToBackendGetDashboardsResponsePayload;
}

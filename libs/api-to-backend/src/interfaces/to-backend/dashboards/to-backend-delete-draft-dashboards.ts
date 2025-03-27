import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteDraftDashboardsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString({ each: true })
  dashboardIds: string[];
}

export class ToBackendDeleteDraftDashboardsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteDraftDashboardsRequestPayload)
  payload: ToBackendDeleteDraftDashboardsRequestPayload;
}

export class ToBackendDeleteDraftDashboardsResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

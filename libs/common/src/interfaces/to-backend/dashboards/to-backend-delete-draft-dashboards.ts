import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

export class ToBackendDeleteDraftDashboardsResponse extends MyResponse {
  payload: { [k in any]: never };
}

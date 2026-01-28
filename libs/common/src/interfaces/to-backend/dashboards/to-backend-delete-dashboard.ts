import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteDashboardRequestPayload {
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

export class ToBackendDeleteDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteDashboardRequestPayload)
  payload: ToBackendDeleteDashboardRequestPayload;
}

export class ToBackendDeleteDashboardResponse extends MyResponse {
  payload: { [k in any]: never };
}

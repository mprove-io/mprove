import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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

export class ToBackendDeleteDashboardResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendModifyDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  dashboardId: string;

  @IsString()
  dashboardFileText: string;
}

export class ToBackendModifyDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendModifyDashboardRequestPayload)
  payload: ToBackendModifyDashboardRequestPayload;
}

export class ToBackendModifyDashboardResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

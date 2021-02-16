import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendModifyDashboardRequestPayload {
  @IsString()
  orgId: string;

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

export class ToBackendModifyDashboardResponsePayload {
  @ValidateNested()
  @Type(() => common.Dashboard)
  dashboard: common.Dashboard;

  @ValidateNested()
  @Type(() => common.Mconfig)
  dashboardMconfigs: common.Mconfig[];

  @ValidateNested()
  @Type(() => common.Query)
  dashboardQueries: common.Query[];
}

export class ToBackendModifyDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendModifyDashboardResponsePayload)
  payload: ToBackendModifyDashboardResponsePayload;
}

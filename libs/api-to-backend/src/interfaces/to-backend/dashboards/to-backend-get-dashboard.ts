import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  dashboardId: string;
}

export class ToBackendGetDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardRequestPayload)
  payload: ToBackendGetDashboardRequestPayload;
}

export class ToBackendGetDashboardResponsePayload {
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

export class ToBackendGetDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardResponsePayload)
  payload: ToBackendGetDashboardResponsePayload;
}

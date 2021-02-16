import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateDashboardRequestPayload {
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

export class ToBackendCreateDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateDashboardRequestPayload)
  payload: ToBackendCreateDashboardRequestPayload;
}

export class ToBackendCreateDashboardResponsePayload {
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

export class ToBackendCreateDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateDashboardResponsePayload)
  payload: ToBackendCreateDashboardResponsePayload;
}

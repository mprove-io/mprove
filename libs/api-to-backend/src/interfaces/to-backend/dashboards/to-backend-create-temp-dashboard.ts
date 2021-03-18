import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateTempDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  oldDashboardId: string;

  @IsString()
  newDashboardId: string;

  @ValidateNested()
  @Type(() => common.DashboardField)
  newDashboardFields: common.DashboardField[];
}

export class ToBackendCreateTempDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateTempDashboardRequestPayload)
  payload: ToBackendCreateTempDashboardRequestPayload;
}

export class ToBackendCreateTempDashboardResponsePayload {
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

export class ToBackendCreateTempDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateTempDashboardResponsePayload)
  payload: ToBackendCreateTempDashboardResponsePayload;
}

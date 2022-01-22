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

  @ValidateNested()
  @Type(() => common.Report)
  reports: common.Report[];
}

export class ToBackendCreateTempDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateTempDashboardRequestPayload)
  payload: ToBackendCreateTempDashboardRequestPayload;
}

export class ToBackendCreateTempDashboardResponsePayload {
  @ValidateNested()
  @Type(() => common.DashboardX)
  dashboard: common.DashboardX;
}

export class ToBackendCreateTempDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateTempDashboardResponsePayload)
  payload: ToBackendCreateTempDashboardResponsePayload;
}

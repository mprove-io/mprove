import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetDashboardReportRequestPayload {
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

  @IsString()
  mconfigId: string;
}

export class ToBackendGetDashboardReportRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardReportRequestPayload)
  payload: ToBackendGetDashboardReportRequestPayload;
}

export class ToBackendGetDashboardReportResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.ReportX)
  report: common.ReportX;
}

export class ToBackendGetDashboardReportResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardReportResponsePayload)
  payload: ToBackendGetDashboardReportResponsePayload;
}

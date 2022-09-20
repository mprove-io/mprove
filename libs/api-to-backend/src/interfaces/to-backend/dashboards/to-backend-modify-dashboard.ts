import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendModifyDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  toDashboardId: string;

  @IsString()
  fromDashboardId: string;

  // for add or replace report

  @IsOptional()
  @ValidateNested()
  @Type(() => common.ReportX)
  newReport?: common.ReportX;

  @IsOptional()
  @IsBoolean()
  isReplaceReport?: boolean;

  @IsOptional()
  @IsString()
  selectedReportTitle?: string;

  // for dashboard

  @IsOptional()
  @IsString()
  dashboardTitle?: string;

  @IsOptional()
  @IsString()
  accessRoles?: string;

  @IsOptional()
  @IsString()
  accessUsers?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => common.ReportX)
  reportsGrid?: common.ReportX[];
}

export class ToBackendModifyDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendModifyDashboardRequestPayload)
  payload: ToBackendModifyDashboardRequestPayload;
}

export class ToBackendModifyDashboardResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

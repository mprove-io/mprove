import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsOptional()
  @IsString()
  fromDashboardId?: string;

  @IsString()
  newDashboardId: string;

  @IsString()
  dashboardTitle: string;

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

export class ToBackendCreateDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateDashboardRequestPayload)
  payload: ToBackendCreateDashboardRequestPayload;
}

export class ToBackendCreateDashboardResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

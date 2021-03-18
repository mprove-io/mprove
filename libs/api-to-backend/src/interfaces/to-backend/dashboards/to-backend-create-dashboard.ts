import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  dashboardId: string;

  @IsString()
  dashboardFileText: string;

  // @IsOptional()
  // @IsString()
  // copyReportsFromDashboardId?: string;

  // @IsString()
  // title: string;

  // @IsOptional()
  // @IsString()
  // gr?: string;

  // @IsString({ each: true })
  // accessUsers: string[];

  // @IsString({ each: true })
  // accessRoles: string[];
}

export class ToBackendCreateDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateDashboardRequestPayload)
  payload: ToBackendCreateDashboardRequestPayload;
}

export class ToBackendCreateDashboardResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

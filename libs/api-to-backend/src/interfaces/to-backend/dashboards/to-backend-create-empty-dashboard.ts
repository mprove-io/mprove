import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateEmptyDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  dashboardId: string;

  @IsString()
  fileText: string;

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

export class ToBackendCreateEmptyDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateEmptyDashboardRequestPayload)
  payload: ToBackendCreateEmptyDashboardRequestPayload;
}

export class ToBackendCreateEmptyDashboardResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

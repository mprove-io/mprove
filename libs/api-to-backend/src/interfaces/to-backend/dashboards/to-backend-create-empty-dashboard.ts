import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateEmptyDashboardRequestPayload {
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
  title: string;

  @IsOptional()
  @IsString()
  gr?: string;

  @IsString({ each: true })
  accessUsers: string[];

  @IsString({ each: true })
  accessRoles: string[];
}

export class ToBackendCreateEmptyDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateEmptyDashboardRequestPayload)
  payload: ToBackendCreateEmptyDashboardRequestPayload;
}

export class ToBackendCreateEmptyDashboardResponsePayload {
  @ValidateNested()
  @Type(() => common.Dashboard)
  dashboard: common.Dashboard;
}

export class ToBackendCreateEmptyDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateEmptyDashboardResponsePayload)
  payload: ToBackendCreateEmptyDashboardResponsePayload;
}

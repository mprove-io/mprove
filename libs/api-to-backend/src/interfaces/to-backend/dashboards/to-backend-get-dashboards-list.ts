import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetDashboardsListRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendGetDashboardsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardsListRequestPayload)
  payload: ToBackendGetDashboardsListRequestPayload;
}

export class ToBackendGetDashboardsListResponsePayloadDashboardsItem {
  @IsString()
  dashboardId: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  gr?: string;

  @IsBoolean()
  hidden: boolean;
}

export class ToBackendGetDashboardsListResponsePayload {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardsListResponsePayloadDashboardsItem)
  dashboardsList: ToBackendGetDashboardsListResponsePayloadDashboardsItem[];
}

export class ToBackendGetDashboardsListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardsListResponsePayload)
  payload: ToBackendGetDashboardsListResponsePayload;
}

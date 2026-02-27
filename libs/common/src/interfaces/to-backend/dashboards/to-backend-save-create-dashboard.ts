import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { DashboardPart } from '#common/interfaces/backend/dashboard-part';
import { TileX } from '#common/interfaces/backend/tile-x';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSaveCreateDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsOptional()
  @IsString()
  fromDashboardId?: string;

  @IsString()
  newDashboardId: string;

  @IsOptional()
  @IsString()
  dashboardTitle?: string;

  @IsOptional()
  @IsString()
  accessRoles?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => TileX)
  tilesGrid?: TileX[];

  @IsString()
  timezone: string;
}

export class ToBackendSaveCreateDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateDashboardRequestPayload)
  payload: ToBackendSaveCreateDashboardRequestPayload;
}

export class ToBackendSaveCreateDashboardResponsePayload {
  @ValidateNested()
  @Type(() => DashboardPart)
  newDashboardPart: DashboardPart;
}

export class ToBackendSaveCreateDashboardResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateDashboardResponsePayload)
  payload: ToBackendSaveCreateDashboardResponsePayload;
}

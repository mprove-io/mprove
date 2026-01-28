import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { DashboardPart } from '#common/interfaces/backend/dashboard-part';
import { DashboardX } from '#common/interfaces/backend/dashboard-x';
import { TileX } from '#common/interfaces/backend/tile-x';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSaveModifyDashboardRequestPayload {
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

  @IsOptional()
  @ValidateNested()
  @Type(() => TileX)
  newTile?: TileX;

  @IsOptional()
  @IsBoolean()
  isReplaceTile?: boolean;

  @IsOptional()
  @IsString()
  selectedTileTitle?: string;

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

export class ToBackendSaveModifyDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyDashboardRequestPayload)
  payload: ToBackendSaveModifyDashboardRequestPayload;
}

export class ToBackendSaveModifyDashboardResponsePayload {
  @ValidateNested()
  @Type(() => DashboardX)
  dashboard: DashboardX;

  @ValidateNested()
  @Type(() => DashboardPart)
  newDashboardPart: DashboardPart;
}

export class ToBackendSaveModifyDashboardResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyDashboardResponsePayload)
  payload: ToBackendSaveModifyDashboardResponsePayload;
}

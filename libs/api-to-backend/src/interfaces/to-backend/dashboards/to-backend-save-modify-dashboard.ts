import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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

  // for add or replace tile

  @IsOptional()
  @ValidateNested()
  @Type(() => common.TileX)
  newTile?: common.TileX;

  @IsOptional()
  @IsBoolean()
  isReplaceTile?: boolean;

  @IsOptional()
  @IsString()
  selectedTileTitle?: string;

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
  @Type(() => common.TileX)
  tilesGrid?: common.TileX[];
}

export class ToBackendSaveModifyDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyDashboardRequestPayload)
  payload: ToBackendSaveModifyDashboardRequestPayload;
}

export class ToBackendSaveModifyDashboardResponsePayload {
  @ValidateNested()
  @Type(() => common.DashboardX)
  newDashboardPart: common.DashboardX;
}

export class ToBackendSaveModifyDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyDashboardResponsePayload)
  payload: ToBackendSaveModifyDashboardResponsePayload;
}

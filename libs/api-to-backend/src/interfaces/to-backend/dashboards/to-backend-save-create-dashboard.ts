import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSaveCreateDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

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
  @Type(() => common.TileX)
  tilesGrid?: common.TileX[];
}

export class ToBackendSaveCreateDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateDashboardRequestPayload)
  payload: ToBackendSaveCreateDashboardRequestPayload;
}

export class ToBackendSaveCreateDashboardResponsePayload {
  @ValidateNested()
  @Type(() => common.DashboardX)
  newDashboardPart: common.DashboardX;
}

export class ToBackendSaveCreateDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateDashboardResponsePayload)
  payload: ToBackendSaveCreateDashboardResponsePayload;
}

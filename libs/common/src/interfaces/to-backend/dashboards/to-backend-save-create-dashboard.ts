import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { TileX } from '~common/interfaces/backend/tile-x';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => TileX)
  tilesGrid?: TileX[];
}

export class ToBackendSaveCreateDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateDashboardRequestPayload)
  payload: ToBackendSaveCreateDashboardRequestPayload;
}

export class ToBackendSaveCreateDashboardResponsePayload {
  @ValidateNested()
  @Type(() => DashboardX)
  newDashboardPart: DashboardX;
}

export class ToBackendSaveCreateDashboardResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateDashboardResponsePayload)
  payload: ToBackendSaveCreateDashboardResponsePayload;
}

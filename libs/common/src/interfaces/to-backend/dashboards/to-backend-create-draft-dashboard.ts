import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { DashboardPart } from '~common/interfaces/backend/dashboard-part';
import { DashboardX } from '~common/interfaces/backend/dashboard-x';
import { DashboardField } from '~common/interfaces/blockml/dashboard-field';
import { Tile } from '~common/interfaces/blockml/tile';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateDraftDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  oldDashboardId: string;

  @IsString()
  newDashboardId: string;

  @ValidateNested()
  @Type(() => DashboardField)
  newDashboardFields: DashboardField[];

  @ValidateNested()
  @Type(() => Tile)
  tiles: Tile[];

  @IsString()
  timezone: string;

  @IsOptional()
  @IsBoolean()
  isQueryCache?: boolean;
}

export class ToBackendCreateDraftDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftDashboardRequestPayload)
  payload: ToBackendCreateDraftDashboardRequestPayload;
}

export class ToBackendCreateDraftDashboardResponsePayload {
  @ValidateNested()
  @Type(() => DashboardPart)
  newDashboardPart: DashboardPart;

  @ValidateNested()
  @Type(() => DashboardX)
  dashboard: DashboardX;
}

export class ToBackendCreateDraftDashboardResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftDashboardResponsePayload)
  payload: ToBackendCreateDraftDashboardResponsePayload;
}

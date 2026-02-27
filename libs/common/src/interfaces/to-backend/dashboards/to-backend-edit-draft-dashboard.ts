import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { DashboardX } from '#common/interfaces/backend/dashboard-x';
import { DashboardField } from '#common/interfaces/blockml/dashboard-field';
import { Tile } from '#common/interfaces/blockml/tile';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendEditDraftDashboardRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

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
}

export class ToBackendEditDraftDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditDraftDashboardRequestPayload)
  payload: ToBackendEditDraftDashboardRequestPayload;
}

export class ToBackendEditDraftDashboardResponsePayload {
  @ValidateNested()
  @Type(() => DashboardX)
  dashboard: DashboardX;
}

export class ToBackendEditDraftDashboardResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditDraftDashboardResponsePayload)
  payload: ToBackendEditDraftDashboardResponsePayload;
}

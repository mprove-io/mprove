import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendEditDraftDashboardRequestPayload {
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
  @Type(() => common.DashboardField)
  newDashboardFields: common.DashboardField[];

  @ValidateNested()
  @Type(() => common.Tile)
  tiles: common.Tile[];

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
  @Type(() => common.DashboardX)
  dashboard: common.DashboardX;
}

export class ToBackendEditDraftDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditDraftDashboardResponsePayload)
  payload: ToBackendEditDraftDashboardResponsePayload;
}

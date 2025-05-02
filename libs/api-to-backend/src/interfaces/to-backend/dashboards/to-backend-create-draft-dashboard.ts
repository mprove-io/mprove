import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.DashboardField)
  newDashboardFields: common.DashboardField[];

  @ValidateNested()
  @Type(() => common.Tile)
  tiles: common.Tile[];

  @IsString()
  timezone: string;
}

export class ToBackendCreateDraftDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftDashboardRequestPayload)
  payload: ToBackendCreateDraftDashboardRequestPayload;
}

export class ToBackendCreateDraftDashboardResponsePayload {
  @ValidateNested()
  @Type(() => common.DashboardX)
  newDashboardPart: common.DashboardX;
}

export class ToBackendCreateDraftDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftDashboardResponsePayload)
  payload: ToBackendCreateDraftDashboardResponsePayload;
}

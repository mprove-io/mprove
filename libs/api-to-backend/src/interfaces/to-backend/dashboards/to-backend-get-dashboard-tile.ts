import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetDashboardTileRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  dashboardId: string;

  @IsString()
  mconfigId: string;
}

export class ToBackendGetDashboardTileRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardTileRequestPayload)
  payload: ToBackendGetDashboardTileRequestPayload;
}

export class ToBackendGetDashboardTileResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.TileX)
  tile: common.TileX;
}

export class ToBackendGetDashboardTileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetDashboardTileResponsePayload)
  payload: ToBackendGetDashboardTileResponsePayload;
}

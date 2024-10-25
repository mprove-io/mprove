import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateTempDashboardRequestPayload {
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

  @IsOptional()
  @IsString()
  deleteFilterMconfigId: string;

  @IsOptional()
  @IsString()
  deleteFilterFieldId: string;

  @ValidateNested()
  @Type(() => common.DashboardField)
  newDashboardFields: common.DashboardField[];

  @ValidateNested()
  @Type(() => common.Tile)
  tiles: common.Tile[];
}

export class ToBackendCreateTempDashboardRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateTempDashboardRequestPayload)
  payload: ToBackendCreateTempDashboardRequestPayload;
}

export class ToBackendCreateTempDashboardResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendModifyVizRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  vizId: string;

  @IsString()
  reportTitle: string;

  @IsOptional()
  @IsString()
  accessRoles?: string;

  @IsOptional()
  @IsString()
  accessUsers?: string;

  @ValidateNested()
  @Type(() => common.MconfigX)
  mconfig: common.MconfigX;
}

export class ToBackendModifyVizRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendModifyVizRequestPayload)
  payload: ToBackendModifyVizRequestPayload;
}

export class ToBackendModifyVizResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

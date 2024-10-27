import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateVizRequestPayload {
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
  tileTitle: string;

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

export class ToBackendCreateVizRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateVizRequestPayload)
  payload: ToBackendCreateVizRequestPayload;
}

export class ToBackendCreateVizResponsePayload {
  @ValidateNested()
  @Type(() => common.VizX)
  viz: common.VizX;
}

export class ToBackendCreateVizResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateVizResponsePayload)
  payload: ToBackendCreateVizResponsePayload;
}

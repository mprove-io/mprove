import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetNavRequestPayload {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsBoolean()
  isRepoProd?: boolean;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class ToBackendGetNavRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetNavRequestPayload)
  payload: ToBackendGetNavRequestPayload;
}

export class ToBackendGetNavResponsePayload {
  @IsString()
  avatarSmall: string;

  @IsString()
  avatarBig: string;

  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @ValidateNested()
  @Type(() => common.User)
  user: common.User;
}

export class ToBackendGetNavResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetNavResponsePayload)
  payload: ToBackendGetNavResponsePayload;
}

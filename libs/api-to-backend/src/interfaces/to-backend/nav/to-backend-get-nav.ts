import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
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
  orgOwnerId: string;

  @IsString()
  orgName: string;

  @IsString()
  projectId: string;

  @IsString()
  projectName: string;

  @IsString()
  projectDefaultBranch: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @ValidateNested()
  @Type(() => common.User)
  user: common.User;

  @IsInt()
  serverNowTs: number;
}

export class ToBackendGetNavResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetNavResponsePayload)
  payload: ToBackendGetNavResponsePayload;
}

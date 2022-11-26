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

  @IsBoolean()
  getRepo: boolean;
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

  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.User)
  user: common.User;

  @IsInt()
  serverNowTs: number;

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendGetNavResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetNavResponsePayload)
  payload: ToBackendGetNavResponsePayload;
}

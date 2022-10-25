import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetStructRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetStructRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetStructRequestPayload)
  payload: ToBackendGetStructRequestPayload;
}

export class ToBackendGetStructResponsePayload {
  @IsBoolean()
  isBranchExist: boolean;

  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;
}

export class ToBackendGetStructResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetStructResponsePayload)
  payload: ToBackendGetStructResponsePayload;
}

import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetModelRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  modelId: string;
}

export class ToBackendGetModelRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetModelRequestPayload)
  payload: ToBackendGetModelRequestPayload;
}

export class ToBackendGetModelResponsePayload {
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

  @ValidateNested()
  @Type(() => common.Model)
  model: common.Model;
}

export class ToBackendGetModelResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetModelResponsePayload)
  payload: ToBackendGetModelResponsePayload;
}

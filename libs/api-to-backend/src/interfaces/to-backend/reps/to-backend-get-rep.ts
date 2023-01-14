import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetRepRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  repId: string;
}

export class ToBackendGetRepRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetRepRequestPayload)
  payload: ToBackendGetRepRequestPayload;
}

export class ToBackendGetRepResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Rep)
  rep: common.Rep;
}

export class ToBackendGetRepResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetRepResponsePayload)
  payload: ToBackendGetRepResponsePayload;
}

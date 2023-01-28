import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSaveModifyRepRequestPayload {
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

  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => common.Row)
  rows: common.Row[];

  @IsString()
  timezone: string;

  @IsEnum(common.TimeSpecEnum)
  timeSpec: common.TimeSpecEnum;

  @ValidateNested()
  @Type(() => common.Fraction)
  timeRangeFraction: common.Fraction;
}

export class ToBackendSaveModifyRepRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyRepRequestPayload)
  payload: ToBackendSaveModifyRepRequestPayload;
}

export class ToBackendSaveModifyRepResponsePayload {
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

export class ToBackendSaveModifyRepResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyRepResponsePayload)
  payload: ToBackendSaveModifyRepResponsePayload;
}

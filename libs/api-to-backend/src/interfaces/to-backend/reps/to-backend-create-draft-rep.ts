import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateDraftRepRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  fromRepId: string;

  @IsBoolean()
  fromDraft: boolean;

  @ValidateNested()
  @Type(() => common.RowChange)
  rowChanges: common.RowChange[];

  @IsString()
  timezone: string;

  @IsEnum(common.TimeSpecEnum)
  timeSpec: common.TimeSpecEnum;

  @ValidateNested()
  @Type(() => common.Fraction)
  timeRangeFraction: common.Fraction;
}

export class ToBackendCreateDraftRepRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftRepRequestPayload)
  payload: ToBackendCreateDraftRepRequestPayload;
}

export class ToBackendCreateDraftRepResponsePayload {
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
  rep: common.RepX;
}

export class ToBackendCreateDraftRepResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftRepResponsePayload)
  payload: ToBackendCreateDraftRepResponsePayload;
}

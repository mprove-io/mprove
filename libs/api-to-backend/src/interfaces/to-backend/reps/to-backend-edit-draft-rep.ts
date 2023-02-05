import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendEditDraftRepRequestPayload {
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

export class ToBackendEditDraftRepRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditDraftRepRequestPayload)
  payload: ToBackendEditDraftRepRequestPayload;
}

export class ToBackendEditDraftRepResponsePayload {
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

export class ToBackendEditDraftRepResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditDraftRepResponsePayload)
  payload: ToBackendEditDraftRepResponsePayload;
}

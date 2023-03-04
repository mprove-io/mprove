import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';
import { IsTimezone } from '~common/functions/is-timezone';

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

  @IsEnum(common.ChangeTypeEnum)
  changeType: common.ChangeTypeEnum;

  @ValidateNested()
  @Type(() => common.RowChange)
  rowChanges: common.RowChange[];

  @IsTimezone()
  timezone: string;

  @IsEnum(common.TimeSpecEnum)
  timeSpec: common.TimeSpecEnum;

  @IsString()
  timeRangeFractionBrick: string;
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

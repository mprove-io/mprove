import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';
import { IsTimezone } from '~common/functions/is-timezone';

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

  @IsEnum(common.ChangeTypeEnum)
  changeType: common.ChangeTypeEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => common.RowChange)
  rowChange: common.RowChange;

  @IsOptional()
  @IsString({ each: true })
  rowIds: string[];

  @IsTimezone()
  timezone: string;

  @IsEnum(common.TimeSpecEnum)
  timeSpec: common.TimeSpecEnum;

  @IsString()
  timeRangeFractionBrick: string;
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

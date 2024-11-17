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

export class ToBackendCreateDraftReportRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  fromReportId: string;

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

export class ToBackendCreateDraftReportRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftReportRequestPayload)
  payload: ToBackendCreateDraftReportRequestPayload;
}

export class ToBackendCreateDraftReportResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Report)
  report: common.ReportX;
}

export class ToBackendCreateDraftReportResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftReportResponsePayload)
  payload: ToBackendCreateDraftReportResponsePayload;
}

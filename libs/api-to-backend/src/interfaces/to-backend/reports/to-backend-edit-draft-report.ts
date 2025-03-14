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

export class ToBackendEditDraftReportRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  reportId: string;

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

  @ValidateNested()
  @Type(() => common.ReportField)
  newReportFields: common.ReportField[];

  @IsOptional()
  @ValidateNested()
  @Type(() => common.Listener)
  listeners?: common.Listener[];

  @ValidateNested()
  @Type(() => common.MconfigChart)
  chart: common.MconfigChart;
}

export class ToBackendEditDraftReportRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditDraftReportRequestPayload)
  payload: ToBackendEditDraftReportRequestPayload;
}

export class ToBackendEditDraftReportResponsePayload {
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

export class ToBackendEditDraftReportResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditDraftReportResponsePayload)
  payload: ToBackendEditDraftReportResponsePayload;
}

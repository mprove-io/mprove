import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';
import { IsTimezone } from '~common/functions/is-timezone';

export class ToBackendSaveModifyReportRequestPayload {
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

  @IsString()
  modReportId: string;

  @IsString()
  title: string;

  @IsString({ each: true })
  accessRoles: string[];

  @IsString({ each: true })
  accessUsers: string[];

  @IsTimezone()
  timezone: string;

  @IsEnum(common.TimeSpecEnum)
  timeSpec: common.TimeSpecEnum;

  @IsString()
  timeRangeFractionBrick: string;
}

export class ToBackendSaveModifyReportRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyReportRequestPayload)
  payload: ToBackendSaveModifyReportRequestPayload;
}

export class ToBackendSaveModifyReportResponsePayload {
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

export class ToBackendSaveModifyReportResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyReportResponsePayload)
  payload: ToBackendSaveModifyReportResponsePayload;
}

import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { IsTimezone } from '#common/functions/is-timezone';
import { Member } from '#common/interfaces/backend/member';
import { ReportX } from '#common/interfaces/backend/report-x';
import { StructX } from '#common/interfaces/backend/struct-x';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetReportRequestPayload {
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

  @IsTimezone()
  timezone: string;

  @IsEnum(TimeSpecEnum)
  timeSpec: TimeSpecEnum;

  @IsString()
  timeRangeFractionBrick: string;
}

export class ToBackendGetReportRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetReportRequestPayload)
  payload: ToBackendGetReportRequestPayload;
}

export class ToBackendGetReportResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Report)
  report: ReportX;
}

export class ToBackendGetReportResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetReportResponsePayload)
  payload: ToBackendGetReportResponsePayload;
}

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ChangeTypeEnum } from '~common/enums/change-type.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { IsTimezone } from '~common/functions/is-timezone';
import { Member } from '~common/interfaces/backend/member';
import { ReportX } from '~common/interfaces/backend/report-x';
import { StructX } from '~common/interfaces/backend/struct-x';
import { Listener } from '~common/interfaces/blockml/listener';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { RowChange } from '~common/interfaces/blockml/row-change';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

  @IsEnum(ChangeTypeEnum)
  changeType: ChangeTypeEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => RowChange)
  rowChange: RowChange;

  @IsOptional()
  @IsString({ each: true })
  rowIds: string[];

  @IsTimezone()
  timezone: string;

  @IsEnum(TimeSpecEnum)
  timeSpec: TimeSpecEnum;

  @IsString()
  timeRangeFractionBrick: string;

  @ValidateNested()
  @Type(() => ReportField)
  newReportFields: ReportField[];

  @IsOptional()
  @ValidateNested()
  @Type(() => Listener)
  listeners?: Listener[];

  @ValidateNested()
  @Type(() => MconfigChart)
  chart: MconfigChart;
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
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => ReportX)
  report: ReportX;
}

export class ToBackendCreateDraftReportResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateDraftReportResponsePayload)
  payload: ToBackendCreateDraftReportResponsePayload;
}

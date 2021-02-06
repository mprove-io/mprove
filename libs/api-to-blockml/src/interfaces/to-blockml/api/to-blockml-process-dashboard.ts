import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import {
  Dashboard,
  DashboardField,
  Mconfig,
  Query,
  UdfsDict
} from '~api-to-blockml/interfaces/ints/_index';
import { ToBlockmlRequest } from '../to-blockml-request';

export class ToBlockmlProcessDashboardRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly structId: string;

  @IsEnum(common.ProjectWeekStartEnum)
  readonly weekStart: common.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => UdfsDict)
  readonly udfsDict: UdfsDict;

  readonly modelContents: any[];

  readonly dashboardContent: any;

  @IsString()
  readonly newDashboardId: string;

  @ValidateNested()
  @Type(() => DashboardField)
  readonly newDashboardFields: DashboardField[];
}

export class ToBlockmlProcessDashboardRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlProcessDashboardRequestPayload)
  readonly payload: ToBlockmlProcessDashboardRequestPayload;
}

export class ToBlockmlProcessDashboardResponsePayload {
  @ValidateNested()
  @Type(() => Dashboard)
  readonly dashboard: Dashboard;

  @ValidateNested()
  @Type(() => Mconfig)
  readonly mconfigs: Mconfig[];

  @ValidateNested()
  @Type(() => Query)
  readonly queries: Query[];
}

export class ToBlockmlProcessDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlProcessDashboardResponsePayload)
  readonly payload: ToBlockmlProcessDashboardResponsePayload;
}

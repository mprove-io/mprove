import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export class ToBlockmlProcessDashboardRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly structId: string;

  @IsEnum(enums.ProjectWeekStartEnum)
  readonly weekStart: enums.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => interfaces.UdfsDict)
  readonly udfsDict: interfaces.UdfsDict;

  readonly modelContents: any[];

  readonly dashboardContent: any;

  @IsString()
  readonly newDashboardId: string;

  @ValidateNested()
  @Type(() => interfaces.DashboardField)
  readonly newDashboardFields: interfaces.DashboardField[];
}

export class ToBlockmlProcessDashboardRequest extends interfaces.ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlProcessDashboardRequestPayload)
  readonly payload: ToBlockmlProcessDashboardRequestPayload;
}

export class ToBlockmlProcessDashboardResponsePayload {
  @ValidateNested()
  @Type(() => interfaces.Dashboard)
  readonly dashboard: interfaces.Dashboard;

  @ValidateNested()
  @Type(() => interfaces.Mconfig)
  readonly mconfigs: interfaces.Mconfig[];

  @ValidateNested()
  @Type(() => interfaces.Query)
  readonly queries: interfaces.Query[];
}

export class ToBlockmlProcessDashboardResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlProcessDashboardResponsePayload)
  readonly payload: ToBlockmlProcessDashboardResponsePayload;
}

import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export class ToBlockmlRebuildStructRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly structId: string;

  @IsEnum(enums.ProjectWeekStartEnum)
  readonly weekStart: enums.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => interfaces.File)
  readonly files: interfaces.File[];

  @ValidateNested()
  @Type(() => interfaces.ProjectConnection)
  readonly connections: interfaces.ProjectConnection[];
}

export class ToBlockmlRebuildStructRequest extends interfaces.ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructRequestPayload)
  readonly payload: ToBlockmlRebuildStructRequestPayload;
}

export class ToBlockmlRebuildStructResponsePayload {
  @ValidateNested()
  @Type(() => interfaces.BmlError)
  readonly errors: interfaces.BmlError[];

  @ValidateNested()
  @Type(() => interfaces.UdfsDict)
  readonly udfsDict: interfaces.UdfsDict;

  @ValidateNested()
  @Type(() => interfaces.View)
  readonly views: interfaces.View[];

  @ValidateNested()
  @Type(() => interfaces.Model)
  readonly models: interfaces.Model[];

  @ValidateNested()
  @Type(() => interfaces.Dashboard)
  readonly dashboards: interfaces.Dashboard[];

  @ValidateNested()
  @Type(() => interfaces.Viz)
  readonly vizs: interfaces.Viz[];

  @ValidateNested()
  @Type(() => interfaces.Mconfig)
  readonly mconfigs: interfaces.Mconfig[];

  @ValidateNested()
  @Type(() => interfaces.Query)
  readonly queries: interfaces.Query[];
}

export class ToBlockmlRebuildStructResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructResponsePayload)
  readonly payload: ToBlockmlRebuildStructResponsePayload;
}

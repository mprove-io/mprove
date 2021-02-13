import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import {
  BmlError,
  Dashboard,
  File,
  Mconfig,
  Model,
  Query,
  UdfsDict,
  View,
  Viz
} from '~api-to-blockml/interfaces/ints/_index';
import { ToBlockmlRequest } from '~api-to-blockml/interfaces/to-blockml/to-blockml-request';

export class ToBlockmlRebuildStructRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  structId: string;

  @IsEnum(common.ProjectWeekStartEnum)
  weekStart: common.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => File)
  files: File[];

  @ValidateNested()
  @Type(() => common.ProjectConnection)
  connections: common.ProjectConnection[];
}

export class ToBlockmlRebuildStructRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructRequestPayload)
  payload: ToBlockmlRebuildStructRequestPayload;
}

export class ToBlockmlRebuildStructResponsePayload {
  @ValidateNested()
  @Type(() => BmlError)
  errors: BmlError[];

  @ValidateNested()
  @Type(() => UdfsDict)
  udfsDict: UdfsDict;

  @ValidateNested()
  @Type(() => View)
  views: View[];

  @ValidateNested()
  @Type(() => Model)
  models: Model[];

  @ValidateNested()
  @Type(() => Dashboard)
  dashboards: Dashboard[];

  @ValidateNested()
  @Type(() => Viz)
  vizs: Viz[];

  @ValidateNested()
  @Type(() => Mconfig)
  mconfigs: Mconfig[];

  @ValidateNested()
  @Type(() => Query)
  queries: Query[];
}

export class ToBlockmlRebuildStructResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructResponsePayload)
  payload: ToBlockmlRebuildStructResponsePayload;
}

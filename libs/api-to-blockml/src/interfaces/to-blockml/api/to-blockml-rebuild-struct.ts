import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import {
  BmlError,
  Dashboard,
  Mconfig,
  Model,
  Query,
  UdfsDict,
  View,
  Viz
} from '~api-to-blockml/interfaces/ints/_index';
import { ToBlockmlRequest } from '../to-blockml-request';

export class ToBlockmlRebuildStructRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly structId: string;

  @IsEnum(common.ProjectWeekStartEnum)
  readonly weekStart: common.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => File)
  readonly files: File[];

  @ValidateNested()
  @Type(() => common.ProjectConnection)
  readonly connections: common.ProjectConnection[];
}

export class ToBlockmlRebuildStructRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructRequestPayload)
  readonly payload: ToBlockmlRebuildStructRequestPayload;
}

export class ToBlockmlRebuildStructResponsePayload {
  @ValidateNested()
  @Type(() => BmlError)
  readonly errors: BmlError[];

  @ValidateNested()
  @Type(() => UdfsDict)
  readonly udfsDict: UdfsDict;

  @ValidateNested()
  @Type(() => View)
  readonly views: View[];

  @ValidateNested()
  @Type(() => Model)
  readonly models: Model[];

  @ValidateNested()
  @Type(() => Dashboard)
  readonly dashboards: Dashboard[];

  @ValidateNested()
  @Type(() => Viz)
  readonly vizs: Viz[];

  @ValidateNested()
  @Type(() => Mconfig)
  readonly mconfigs: Mconfig[];

  @ValidateNested()
  @Type(() => Query)
  readonly queries: Query[];
}

export class ToBlockmlRebuildStructResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructResponsePayload)
  readonly payload: ToBlockmlRebuildStructResponsePayload;
}

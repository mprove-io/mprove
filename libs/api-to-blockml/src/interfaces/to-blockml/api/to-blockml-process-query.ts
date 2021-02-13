import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import {
  Mconfig,
  Query,
  UdfsDict
} from '~api-to-blockml/interfaces/ints/_index';
import { ToBlockmlRequest } from '~api-to-blockml/interfaces/to-blockml/to-blockml-request';

export class ToBlockmlProcessQueryRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsEnum(common.ProjectWeekStartEnum)
  weekStart: common.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => UdfsDict)
  udfsDict: UdfsDict;

  @ValidateNested()
  @Type(() => Mconfig)
  mconfig: Mconfig;

  modelContent: any;
}

export class ToBlockmlProcessQueryRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlProcessQueryRequestPayload)
  payload: ToBlockmlProcessQueryRequestPayload;
}

export class ToBlockmlProcessQueryResponsePayload {
  @ValidateNested()
  @Type(() => Query)
  query: Query;

  @ValidateNested()
  @Type(() => Mconfig)
  mconfig: Mconfig;
}

export class ToBlockmlProcessQueryResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlProcessQueryResponsePayload)
  payload: ToBlockmlProcessQueryResponsePayload;
}

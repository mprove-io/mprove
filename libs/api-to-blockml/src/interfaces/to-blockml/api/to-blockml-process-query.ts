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
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsEnum(common.ProjectWeekStartEnum)
  readonly weekStart: common.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => UdfsDict)
  readonly udfsDict: UdfsDict;

  @ValidateNested()
  @Type(() => Mconfig)
  readonly mconfig: Mconfig;

  readonly modelContent: any;
}

export class ToBlockmlProcessQueryRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlProcessQueryRequestPayload)
  readonly payload: ToBlockmlProcessQueryRequestPayload;
}

export class ToBlockmlProcessQueryResponsePayload {
  @ValidateNested()
  @Type(() => Query)
  readonly query: Query;

  @ValidateNested()
  @Type(() => Mconfig)
  readonly mconfig: Mconfig;
}

export class ToBlockmlProcessQueryResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlProcessQueryResponsePayload)
  readonly payload: ToBlockmlProcessQueryResponsePayload;
}

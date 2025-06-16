import { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlRequest } from '~api-to-blockml/interfaces/to-blockml/to-blockml-request';

export class ToBlockmlProcessQueryRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsEnum(common.ProjectWeekStartEnum)
  weekStart: common.ProjectWeekStartEnum;

  @IsBoolean()
  caseSensitiveStringFilters: boolean;

  @IsBoolean()
  simplifySafeAggregates: boolean;

  @ValidateNested()
  @Type(() => common.UdfsDict)
  udfsDict: common.UdfsDict;

  @ValidateNested()
  @Type(() => common.Mconfig)
  mconfig: common.Mconfig;

  @ValidateNested()
  @Type(() => common.ProjectConnection)
  connections: common.ProjectConnection[];

  malloyModelDef: MalloyModelDef;

  modelContent: any;
}

export class ToBlockmlProcessQueryRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlProcessQueryRequestPayload)
  payload: ToBlockmlProcessQueryRequestPayload;
}

export class ToBlockmlProcessQueryResponsePayload {
  @ValidateNested()
  @Type(() => common.Query)
  query: common.Query;

  @ValidateNested()
  @Type(() => common.Mconfig)
  mconfig: common.Mconfig;
}

export class ToBlockmlProcessQueryResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlProcessQueryResponsePayload)
  payload: ToBlockmlProcessQueryResponsePayload;
}

import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlRequest } from '~api-to-blockml/interfaces/to-blockml/to-blockml-request';

export class ToBlockmlProcessQueryRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsEnum(common.ProjectWeekStartEnum)
  weekStart: common.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => common.UdfsDict)
  udfsDict: common.UdfsDict;

  @ValidateNested()
  @Type(() => common.Mconfig)
  mconfig: common.Mconfig;

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

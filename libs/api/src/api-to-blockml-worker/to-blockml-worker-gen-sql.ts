import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import * as apiObjects from '~/objects/_index';

export class ToBlockmlWorkerGenSqlRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToBlockmlWorkerRequestInfo)
  readonly info: apiObjects.ToBlockmlWorkerRequestInfo;

  readonly payload: any;
}

export class ToBlockmlWorkerGenSqlResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  readonly payload: any;
}

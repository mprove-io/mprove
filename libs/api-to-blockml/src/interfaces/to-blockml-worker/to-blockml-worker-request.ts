import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlWorkerRequestInfo } from './to-blockml-worker-request-info';

export class ToBlockmlWorkerRequest implements common.MyRequest {
  @ValidateNested()
  @Type(() => ToBlockmlWorkerRequestInfo)
  readonly info: ToBlockmlWorkerRequestInfo;

  readonly payload: any;
}

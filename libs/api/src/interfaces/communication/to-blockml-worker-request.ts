import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MyRequest } from './my-request';
import { ToBlockmlWorkerRequestInfo } from './to-blockml-worker-request-info';

export class ToBlockmlWorkerRequest implements MyRequest {
  @ValidateNested()
  @Type(() => ToBlockmlWorkerRequestInfo)
  readonly info: ToBlockmlWorkerRequestInfo;

  readonly payload: any;
}

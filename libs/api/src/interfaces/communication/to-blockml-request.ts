import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MyRequest } from './my-request';
import { ToBlockmlRequestInfo } from './to-blockml-request-info';

export class ToBlockmlRequest implements MyRequest {
  @ValidateNested()
  @Type(() => ToBlockmlRequestInfo)
  readonly info: ToBlockmlRequestInfo;

  readonly payload: any;
}

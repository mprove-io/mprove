import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlRequestInfo } from './to-blockml-request-info';

export class ToBlockmlRequest implements common.MyRequest {
  @ValidateNested()
  @Type(() => ToBlockmlRequestInfo)
  readonly info: ToBlockmlRequestInfo;

  readonly payload: any;
}

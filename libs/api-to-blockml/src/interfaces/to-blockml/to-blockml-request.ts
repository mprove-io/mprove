import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlRequestInfo } from './to-blockml-request-info';

export class ToBlockmlRequest extends common.MyRequest {
  @ValidateNested()
  @Type(() => ToBlockmlRequestInfo)
  info: ToBlockmlRequestInfo;
}

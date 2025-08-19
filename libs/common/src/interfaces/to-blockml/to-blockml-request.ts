import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MyRequest } from '~common/interfaces/to/my-request';
import { ToBlockmlRequestInfo } from './to-blockml-request-info';

export class ToBlockmlRequest extends MyRequest {
  @ValidateNested()
  @Type(() => ToBlockmlRequestInfo)
  info: ToBlockmlRequestInfo;
}

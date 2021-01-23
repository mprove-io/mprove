import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { RequestInfo } from './request-info';

export class Request {
  @ValidateNested()
  @Type(() => RequestInfo)
  readonly info: RequestInfo;

  readonly payload: any;
}

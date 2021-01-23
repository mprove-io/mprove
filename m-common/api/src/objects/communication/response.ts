import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ResponseInfo } from './response-info';

export class Response {
  @ValidateNested()
  @Type(() => ResponseInfo)
  readonly info: ResponseInfo;

  readonly payload: any;
}

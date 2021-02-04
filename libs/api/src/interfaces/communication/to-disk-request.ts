import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MyRequest } from './my-request';
import { ToDiskRequestInfo } from './to-disk-request-info';

export class ToDiskRequest implements MyRequest {
  @ValidateNested()
  @Type(() => ToDiskRequestInfo)
  readonly info: ToDiskRequestInfo;

  readonly payload: any;
}

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequestInfo } from './to-disk-request-info';

export class ToDiskRequest implements common.MyRequest {
  @ValidateNested()
  @Type(() => ToDiskRequestInfo)
  readonly info: ToDiskRequestInfo;

  readonly payload: any;
}

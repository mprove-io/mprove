import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequestInfo } from './to-disk-request-info';

export class ToDiskRequest extends common.MyRequest {
  @ValidateNested()
  @Type(() => ToDiskRequestInfo)
  info: ToDiskRequestInfo;
}

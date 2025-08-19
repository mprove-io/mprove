import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MyRequest } from '../to/my-request';
import { ToDiskRequestInfo } from './to-disk-request-info';

export class ToDiskRequest extends MyRequest {
  @ValidateNested()
  @Type(() => ToDiskRequestInfo)
  info: ToDiskRequestInfo;
}

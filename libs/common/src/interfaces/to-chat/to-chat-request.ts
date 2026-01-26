import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { MyRequest } from '../to/my-request';
import { ToChatRequestInfo } from './to-chat-request-info';

export class ToChatRequest extends MyRequest {
  @ValidateNested()
  @Type(() => ToChatRequestInfo)
  info: ToChatRequestInfo;
}

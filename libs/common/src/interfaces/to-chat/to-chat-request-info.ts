import { IsEnum, IsString } from 'class-validator';
import { ToChatRequestInfoNameEnum } from '~common/enums/to/to-chat-request-info-name.enum';
import { RequestInfo } from '../to/request-info';

export class ToChatRequestInfo extends RequestInfo {
  @IsEnum(ToChatRequestInfoNameEnum)
  name: ToChatRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

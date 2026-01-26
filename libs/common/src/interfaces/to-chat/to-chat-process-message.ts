import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ChatState } from '~common/interfaces/chat/chat-state';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToChatRequest } from './to-chat-request';

export class ToChatProcessMessageRequestPayload {
  @IsString()
  message: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatState)
  startState: ChatState;
}

export class ToChatProcessMessageRequest extends ToChatRequest {
  @ValidateNested()
  @Type(() => ToChatProcessMessageRequestPayload)
  payload: ToChatProcessMessageRequestPayload;
}

export class ToChatProcessMessageResponsePayload {
  @IsString()
  answer: string;

  @ValidateNested()
  @Type(() => ChatState)
  endState: ChatState;
}

export class ToChatProcessMessageResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToChatProcessMessageResponsePayload)
  payload: ToChatProcessMessageResponsePayload;
}

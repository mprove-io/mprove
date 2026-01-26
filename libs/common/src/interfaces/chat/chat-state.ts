import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ChatMessage } from './chat-message';

export class ChatState {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessage)
  messages: ChatMessage[];
}

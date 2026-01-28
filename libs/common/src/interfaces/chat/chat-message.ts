import { IsEnum, IsString } from 'class-validator';
import { ChatMessageRoleEnum } from '#common/enums/chat-message-role.enum';

export class ChatMessage {
  @IsEnum(ChatMessageRoleEnum)
  role: ChatMessageRoleEnum;

  @IsString()
  content: string;
}

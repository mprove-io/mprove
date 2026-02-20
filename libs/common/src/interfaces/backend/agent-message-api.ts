import type { Message } from '@opencode-ai/sdk/v2';
import { IsString } from 'class-validator';

export class AgentMessageApi {
  @IsString()
  messageId: string;

  @IsString()
  sessionId: string;

  @IsString()
  role: string;

  ocMessage: Message;
}

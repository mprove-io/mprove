import type { Part } from '@opencode-ai/sdk/v2';
import { IsString } from 'class-validator';

export class AgentPartApi {
  @IsString()
  partId: string;

  @IsString()
  messageId: string;

  @IsString()
  sessionId: string;

  ocPart: Part;
}

import type { Event } from '@opencode-ai/sdk';
import { IsInt, IsString } from 'class-validator';

export class AgentEventApi {
  @IsString()
  eventId: string;

  @IsInt()
  eventIndex: number;

  @IsString()
  eventType: string;

  ocEvent: Event;
}

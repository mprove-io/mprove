import type { Event } from '@opencode-ai/sdk/v2';
import { IsInt, IsString } from 'class-validator';

export class SessionEventApi {
  @IsString()
  eventId: string;

  @IsInt()
  eventIndex: number;

  @IsString()
  eventType: string;

  ocEvent: Event;
}

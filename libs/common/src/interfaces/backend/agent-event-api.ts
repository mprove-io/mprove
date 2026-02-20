import type {
  Event,
  PermissionRequest,
  QuestionRequest,
  SessionStatus
} from '@opencode-ai/sdk/v2';
import { IsInt, IsString } from 'class-validator';

export type { Event, PermissionRequest, QuestionRequest, SessionStatus };

export class AgentEventApi {
  @IsString()
  eventId: string;

  @IsInt()
  eventIndex: number;

  @IsString()
  eventType: string;

  ocEvent: Event;
}

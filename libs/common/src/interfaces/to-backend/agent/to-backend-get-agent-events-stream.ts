import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import type { UniversalEventData } from 'sandbox-agent';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetAgentEventsStreamRequestPayload {
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsNumber()
  lastSequence?: number;
}

export class ToBackendGetAgentEventsStreamRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetAgentEventsStreamRequestPayload)
  payload: ToBackendGetAgentEventsStreamRequestPayload;
}

export class AgentEventItem {
  eventId: string;
  sequence: number;
  type: string;
  eventData: UniversalEventData;
}

export class ToBackendGetAgentEventsStreamResponsePayload {
  @IsArray()
  events: AgentEventItem[];
}

export class ToBackendGetAgentEventsStreamResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetAgentEventsStreamResponsePayload)
  payload: ToBackendGetAgentEventsStreamResponsePayload;
}

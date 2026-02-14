import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetAgentSessionRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendGetAgentSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetAgentSessionRequestPayload)
  payload: ToBackendGetAgentSessionRequestPayload;
}

export class ToBackendGetAgentSessionResponsePayload {
  session: AgentSessionApi;
  events: AgentEventApi[];
}

export class ToBackendGetAgentSessionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetAgentSessionResponsePayload)
  payload: ToBackendGetAgentSessionResponsePayload;
}

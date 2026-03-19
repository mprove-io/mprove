import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { AgentEventApi } from '#common/interfaces/backend/agent-event-api';
import { AgentMessageApi } from '#common/interfaces/backend/agent-message-api';
import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';
import { OcSessionApi } from '#common/interfaces/backend/oc-session-api';
import { SessionApi } from '#common/interfaces/backend/session-api';
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
  session: SessionApi;
  ocSession?: OcSessionApi;
  debugEvents: AgentEventApi[];
  lastEventIndex: number;
  messages?: AgentMessageApi[];
  parts?: AgentPartApi[];
  sessions: SessionApi[];
  hasMoreArchived: boolean;
}

export class ToBackendGetAgentSessionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetAgentSessionResponsePayload)
  payload: ToBackendGetAgentSessionResponsePayload;
}

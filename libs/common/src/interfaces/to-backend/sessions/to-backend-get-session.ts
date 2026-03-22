import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { AgentMessageApi } from '#common/interfaces/backend/agent-message-api';
import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';
import { OcSessionApi } from '#common/interfaces/backend/oc-session-api';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { SessionEventApi } from '#common/interfaces/backend/session-event-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetSessionRequestPayload {
  @IsString()
  sessionId: string;

  @IsBoolean()
  skipFetchSessionState: boolean;
}

export class ToBackendGetSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetSessionRequestPayload)
  payload: ToBackendGetSessionRequestPayload;
}

export class ToBackendGetSessionResponsePayload {
  session: SessionApi;
  ocSession: OcSessionApi;
  lastEventIndex: number;
  messages: AgentMessageApi[];
  parts: AgentPartApi[];
  events: SessionEventApi[];
  sessions: SessionApi[];
  hasMoreArchived: boolean;
}

export class ToBackendGetSessionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetSessionResponsePayload)
  payload: ToBackendGetSessionResponsePayload;
}

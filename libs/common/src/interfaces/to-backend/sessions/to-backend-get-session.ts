import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { OcSessionApi } from '#common/interfaces/backend/oc-session-api';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { SessionEventApi } from '#common/interfaces/backend/session-event-api';
import { SessionMessageApi } from '#common/interfaces/backend/session-message-api';
import { SessionPartApi } from '#common/interfaces/backend/session-part-api';
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
  messages: SessionMessageApi[];
  parts: SessionPartApi[];
  events: SessionEventApi[];
  sessions: SessionApi[];
  hasMoreArchived: boolean;
}

export class ToBackendGetSessionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetSessionResponsePayload)
  payload: ToBackendGetSessionResponsePayload;
}

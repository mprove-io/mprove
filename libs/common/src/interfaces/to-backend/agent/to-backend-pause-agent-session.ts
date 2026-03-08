import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import type { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendPauseAgentSessionRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendPauseAgentSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendPauseAgentSessionRequestPayload)
  payload: ToBackendPauseAgentSessionRequestPayload;
}

export interface ToBackendPauseAgentSessionResponsePayload {
  session: SessionApi;
}

export class ToBackendPauseAgentSessionResponse extends MyResponse {
  payload: ToBackendPauseAgentSessionResponsePayload;
}

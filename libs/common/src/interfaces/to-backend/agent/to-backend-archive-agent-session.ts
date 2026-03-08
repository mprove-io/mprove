import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import type { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendArchiveAgentSessionRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendArchiveAgentSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendArchiveAgentSessionRequestPayload)
  payload: ToBackendArchiveAgentSessionRequestPayload;
}

export interface ToBackendArchiveAgentSessionResponsePayload {
  session: SessionApi;
}

export class ToBackendArchiveAgentSessionResponse extends MyResponse {
  payload: ToBackendArchiveAgentSessionResponsePayload;
}

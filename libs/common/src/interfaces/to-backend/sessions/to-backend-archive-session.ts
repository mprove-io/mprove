import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import type { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendArchiveSessionRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendArchiveSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendArchiveSessionRequestPayload)
  payload: ToBackendArchiveSessionRequestPayload;
}

export interface ToBackendArchiveSessionResponsePayload {
  session: SessionApi;
}

export class ToBackendArchiveSessionResponse extends MyResponse {
  payload: ToBackendArchiveSessionResponsePayload;
}

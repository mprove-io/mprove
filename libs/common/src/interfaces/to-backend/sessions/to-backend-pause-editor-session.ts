import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import type { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendPauseEditorSessionRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendPauseEditorSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendPauseEditorSessionRequestPayload)
  payload: ToBackendPauseEditorSessionRequestPayload;
}

export interface ToBackendPauseEditorSessionResponsePayload {
  session: SessionApi;
}

export class ToBackendPauseEditorSessionResponse extends MyResponse {
  payload: ToBackendPauseEditorSessionResponsePayload;
}

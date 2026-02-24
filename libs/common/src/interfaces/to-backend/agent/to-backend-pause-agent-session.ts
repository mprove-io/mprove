import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
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

export class ToBackendPauseAgentSessionResponse extends MyResponse {
  payload: { [k in any]: never };
}

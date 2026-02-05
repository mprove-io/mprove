import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteAgentSessionRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendDeleteAgentSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteAgentSessionRequestPayload)
  payload: ToBackendDeleteAgentSessionRequestPayload;
}

export class ToBackendDeleteAgentSessionResponse extends MyResponse {
  payload: { [k in any]: never };
}

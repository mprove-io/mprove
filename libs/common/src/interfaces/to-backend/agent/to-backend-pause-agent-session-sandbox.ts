import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendPauseAgentSessionSandboxRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendPauseAgentSessionSandboxRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendPauseAgentSessionSandboxRequestPayload)
  payload: ToBackendPauseAgentSessionSandboxRequestPayload;
}

export class ToBackendPauseAgentSessionSandboxResponse extends MyResponse {
  payload: { [k in any]: never };
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendStopAgentSessionSandboxRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendStopAgentSessionSandboxRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendStopAgentSessionSandboxRequestPayload)
  payload: ToBackendStopAgentSessionSandboxRequestPayload;
}

export class ToBackendStopAgentSessionSandboxResponse extends MyResponse {
  payload: { [k in any]: never };
}

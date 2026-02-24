import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
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

export class ToBackendArchiveAgentSessionResponse extends MyResponse {
  payload: { [k in any]: never };
}

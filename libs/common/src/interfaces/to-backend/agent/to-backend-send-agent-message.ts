import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSendAgentMessageRequestPayload {
  @IsString()
  sessionId: string;

  @IsString()
  message: string;
}

export class ToBackendSendAgentMessageRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSendAgentMessageRequestPayload)
  payload: ToBackendSendAgentMessageRequestPayload;
}

export class ToBackendSendAgentMessageResponse extends MyResponse {
  payload: { [k in any]: never };
}

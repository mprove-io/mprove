import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateAgentSseTicketRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendCreateAgentSseTicketRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateAgentSseTicketRequestPayload)
  payload: ToBackendCreateAgentSseTicketRequestPayload;
}

export class ToBackendCreateAgentSseTicketResponsePayload {
  @IsString()
  sseTicket: string;
}

export class ToBackendCreateAgentSseTicketResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateAgentSseTicketResponsePayload)
  payload: ToBackendCreateAgentSseTicketResponsePayload;
}

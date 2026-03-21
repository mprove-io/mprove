import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateSessionSseTicketRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendCreateSessionSseTicketRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateSessionSseTicketRequestPayload)
  payload: ToBackendCreateSessionSseTicketRequestPayload;
}

export class ToBackendCreateSessionSseTicketResponsePayload {
  @IsString()
  sseTicket: string;
}

export class ToBackendCreateSessionSseTicketResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateSessionSseTicketResponsePayload)
  payload: ToBackendCreateSessionSseTicketResponsePayload;
}

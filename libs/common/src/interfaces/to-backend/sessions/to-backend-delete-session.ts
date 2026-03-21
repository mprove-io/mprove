import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteSessionRequestPayload {
  @IsString()
  sessionId: string;
}

export class ToBackendDeleteSessionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteSessionRequestPayload)
  payload: ToBackendDeleteSessionRequestPayload;
}

export class ToBackendDeleteSessionResponse extends MyResponse {
  payload: { [k in any]: never };
}

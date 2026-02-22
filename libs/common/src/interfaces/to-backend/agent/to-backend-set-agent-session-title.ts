import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSetAgentSessionTitleRequestPayload {
  @IsString()
  sessionId: string;

  @IsString()
  title: string;
}

export class ToBackendSetAgentSessionTitleRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetAgentSessionTitleRequestPayload)
  payload: ToBackendSetAgentSessionTitleRequestPayload;
}

export class ToBackendSetAgentSessionTitleResponse extends MyResponse {
  payload: { [k in any]: never };
}

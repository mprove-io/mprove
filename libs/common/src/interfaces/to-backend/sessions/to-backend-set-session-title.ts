import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSetSessionTitleRequestPayload {
  @IsString()
  sessionId: string;

  @IsString()
  title: string;
}

export class ToBackendSetSessionTitleRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetSessionTitleRequestPayload)
  payload: ToBackendSetSessionTitleRequestPayload;
}

export class ToBackendSetSessionTitleResponse extends MyResponse {
  payload: { [k in any]: never };
}

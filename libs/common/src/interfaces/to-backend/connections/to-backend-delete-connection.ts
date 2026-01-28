import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteConnectionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  connectionId: string;
}

export class ToBackendDeleteConnectionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteConnectionRequestPayload)
  payload: ToBackendDeleteConnectionRequestPayload;
}

export class ToBackendDeleteConnectionResponse extends MyResponse {
  payload: { [k in any]: never };
}

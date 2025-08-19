import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteProjectRequestPayload {
  @IsString()
  projectId: string;
}

export class ToBackendDeleteProjectRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteProjectRequestPayload)
  payload: ToBackendDeleteProjectRequestPayload;
}

export class ToBackendDeleteProjectResponse extends MyResponse {
  payload: { [k in any]: never };
}

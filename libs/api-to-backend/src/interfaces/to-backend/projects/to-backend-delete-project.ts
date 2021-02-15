import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteProjectRequestPayload {
  @IsString()
  projectId: string;
}

export class ToBackendDeleteProjectRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteProjectRequestPayload)
  payload: ToBackendDeleteProjectRequestPayload;
}

export class ToBackendDeleteProjectResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

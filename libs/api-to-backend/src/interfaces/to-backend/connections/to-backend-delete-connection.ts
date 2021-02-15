import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteConnectionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  connectionId: string;
}

export class ToBackendDeleteConnectionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteConnectionRequestPayload)
  payload: ToBackendDeleteConnectionRequestPayload;
}

export class ToBackendDeleteConnectionResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

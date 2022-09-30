import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteEvRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  evId: string;
}

export class ToBackendDeleteEvRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteEvRequestPayload)
  payload: ToBackendDeleteEvRequestPayload;
}

export class ToBackendDeleteEvResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

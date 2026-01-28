import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteOrgRequestPayload {
  @IsString()
  orgId: string;
}

export class ToBackendDeleteOrgRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteOrgRequestPayload)
  payload: ToBackendDeleteOrgRequestPayload;
}

export class ToBackendDeleteOrgResponse extends MyResponse {
  payload: { [k in any]: never };
}

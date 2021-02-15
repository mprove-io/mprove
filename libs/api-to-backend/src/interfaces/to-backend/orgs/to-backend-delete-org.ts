import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteOrgRequestPayload {
  @IsString()
  orgId: string;
}

export class ToBackendDeleteOrgRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteOrgRequestPayload)
  payload: ToBackendDeleteOrgRequestPayload;
}

export class ToBackendDeleteOrgResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Org } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetOrgAccountRequestPayload {
  @IsString()
  orgId: string;
}

export class ToBackendGetOrgAccountRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetOrgAccountRequestPayload)
  payload: ToBackendGetOrgAccountRequestPayload;
}

export class ToBackendGetOrgAccountResponsePayload {
  @IsString()
  org: Org;
}

export class ToBackendGetOrgAccountResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetOrgAccountResponsePayload)
  payload: ToBackendGetOrgAccountResponsePayload;
}

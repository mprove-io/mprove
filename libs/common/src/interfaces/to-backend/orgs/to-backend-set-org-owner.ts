import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Org } from '~common/interfaces/backend/org';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSetOrgOwnerRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  ownerEmail: string;
}

export class ToBackendSetOrgOwnerRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetOrgOwnerRequestPayload)
  payload: ToBackendSetOrgOwnerRequestPayload;
}

export class ToBackendSetOrgOwnerResponsePayload {
  @ValidateNested()
  @Type(() => Org)
  org: Org;
}

export class ToBackendSetOrgOwnerResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetOrgOwnerResponsePayload)
  payload: ToBackendSetOrgOwnerResponsePayload;
}

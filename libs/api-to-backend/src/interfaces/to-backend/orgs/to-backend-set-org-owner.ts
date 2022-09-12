import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.Org)
  org: common.Org;
}

export class ToBackendSetOrgOwnerResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetOrgOwnerResponsePayload)
  payload: ToBackendSetOrgOwnerResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Org } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetOrgOwnerRequestPayload {
  @IsString()
  readonly orgId: string;

  @IsString()
  readonly ownerEmail: string;
}

export class ToBackendSetOrgOwnerRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetOrgOwnerRequestPayload)
  readonly payload: ToBackendSetOrgOwnerRequestPayload;
}

export class ToBackendSetOrgOwnerResponsePayload {
  @IsString()
  readonly org: Org;
}

export class ToBackendSetOrgOwnerResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetOrgOwnerResponsePayload)
  readonly payload: ToBackendSetOrgOwnerResponsePayload;
}

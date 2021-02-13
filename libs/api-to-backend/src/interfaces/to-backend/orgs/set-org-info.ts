import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Org } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetOrgInfoRequestPayload {
  @IsString()
  readonly orgId: string;

  @IsString()
  readonly companySize: string;

  @IsString()
  readonly contactPhone: string;
}

export class ToBackendSetOrgInfoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetOrgInfoRequestPayload)
  readonly payload: ToBackendSetOrgInfoRequestPayload;
}

export class ToBackendSetOrgInfoResponsePayload {
  @IsString()
  readonly org: Org;
}

export class ToBackendSetOrgInfoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetOrgInfoResponsePayload)
  readonly payload: ToBackendSetOrgInfoResponsePayload;
}

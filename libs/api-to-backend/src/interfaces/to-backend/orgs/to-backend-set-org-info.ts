import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetOrgInfoRequestPayload {
  @IsString()
  orgId: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class ToBackendSetOrgInfoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetOrgInfoRequestPayload)
  payload: ToBackendSetOrgInfoRequestPayload;
}

export class ToBackendSetOrgInfoResponsePayload {
  @ValidateNested()
  @Type(() => common.Org)
  org: common.Org;
}

export class ToBackendSetOrgInfoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetOrgInfoResponsePayload)
  payload: ToBackendSetOrgInfoResponsePayload;
}

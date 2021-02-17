import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetOrgInfoRequestPayload {
  @IsString()
  orgId: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;
}

export class ToBackendSetOrgInfoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetOrgInfoRequestPayload)
  payload: ToBackendSetOrgInfoRequestPayload;
}

export class ToBackendSetOrgInfoResponsePayload {
  @IsString()
  org: common.Org;
}

export class ToBackendSetOrgInfoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetOrgInfoResponsePayload)
  payload: ToBackendSetOrgInfoResponsePayload;
}

import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Org } from '~common/interfaces/backend/org';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Org)
  org: Org;
}

export class ToBackendSetOrgInfoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetOrgInfoResponsePayload)
  payload: ToBackendSetOrgInfoResponsePayload;
}

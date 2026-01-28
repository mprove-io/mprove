import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Org } from '#common/interfaces/backend/org';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetOrgRequestPayload {
  @IsString()
  orgId: string;
}

export class ToBackendGetOrgRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetOrgRequestPayload)
  payload: ToBackendGetOrgRequestPayload;
}

export class ToBackendGetOrgResponsePayload {
  @ValidateNested()
  @Type(() => Org)
  org: Org;
}

export class ToBackendGetOrgResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetOrgResponsePayload)
  payload: ToBackendGetOrgResponsePayload;
}

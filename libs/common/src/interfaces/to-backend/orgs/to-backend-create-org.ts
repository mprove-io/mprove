import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Org } from '#common/interfaces/backend/org';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateOrgRequestPayload {
  @IsString()
  name: string;
}

export class ToBackendCreateOrgRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateOrgRequestPayload)
  payload: ToBackendCreateOrgRequestPayload;
}

export class ToBackendCreateOrgResponsePayload {
  @ValidateNested()
  @Type(() => Org)
  org: Org;
}

export class ToBackendCreateOrgResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateOrgResponsePayload)
  payload: ToBackendCreateOrgResponsePayload;
}

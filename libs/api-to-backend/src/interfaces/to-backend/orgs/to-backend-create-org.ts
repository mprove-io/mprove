import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Org } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @IsString()
  org: Org;
}

export class ToBackendCreateOrgResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateOrgResponsePayload)
  payload: ToBackendCreateOrgResponsePayload;
}

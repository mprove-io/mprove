import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Org } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateOrgRequestPayload {
  @IsString()
  readonly name: string;
}

export class ToBackendCreateOrgRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateOrgRequestPayload)
  readonly payload: ToBackendCreateOrgRequestPayload;
}

export class ToBackendCreateOrgResponsePayload {
  @IsString()
  readonly org: Org;
}

export class ToBackendCreateOrgResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateOrgResponsePayload)
  readonly payload: ToBackendCreateOrgResponsePayload;
}

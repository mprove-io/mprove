import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @IsString()
  org: common.Org;
}

export class ToBackendGetOrgResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetOrgResponsePayload)
  payload: ToBackendGetOrgResponsePayload;
}

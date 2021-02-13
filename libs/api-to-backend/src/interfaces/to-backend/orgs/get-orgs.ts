import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetOrgsRequest extends ToBackendRequest {
  readonly payload: { [k in any]: never };
}

export class ToBackendGetOrgsResponsePayloadOrgsItem {
  @IsString()
  readonly orgId: string;

  @IsString()
  readonly name: string;
}

export class ToBackendGetOrgsResponsePayload {
  @ValidateNested()
  @Type(() => ToBackendGetOrgsResponsePayloadOrgsItem)
  readonly orgsList: ToBackendGetOrgsResponsePayloadOrgsItem[];
}

export class ToBackendGetOrgsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetOrgsResponsePayload)
  readonly payload: ToBackendGetOrgsResponsePayload;
}

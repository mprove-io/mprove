import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetOrgsListRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendGetOrgsListResponsePayloadOrgsItem {
  @IsString()
  orgId: string;

  @IsString()
  name: string;
}

export class ToBackendGetOrgsListResponsePayload {
  @ValidateNested()
  @Type(() => ToBackendGetOrgsListResponsePayloadOrgsItem)
  orgsList: ToBackendGetOrgsListResponsePayloadOrgsItem[];
}

export class ToBackendGetOrgsListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetOrgsListResponsePayload)
  payload: ToBackendGetOrgsListResponsePayload;
}

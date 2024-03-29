import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetOrgsListRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendGetOrgsListResponsePayload {
  @ValidateNested()
  @Type(() => common.OrgsItem)
  orgsList: common.OrgsItem[];
}

export class ToBackendGetOrgsListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetOrgsListResponsePayload)
  payload: ToBackendGetOrgsListResponsePayload;
}

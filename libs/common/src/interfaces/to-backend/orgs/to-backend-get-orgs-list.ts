import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { OrgsItem } from '#common/interfaces/backend/orgs-item';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetOrgsListRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendGetOrgsListResponsePayload {
  @ValidateNested()
  @Type(() => OrgsItem)
  orgsList: OrgsItem[];
}

export class ToBackendGetOrgsListResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetOrgsListResponsePayload)
  payload: ToBackendGetOrgsListResponsePayload;
}

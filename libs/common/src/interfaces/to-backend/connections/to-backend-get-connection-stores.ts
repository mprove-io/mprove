import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';
import type { StoreItem } from './store-item';

export class ToBackendGetConnectionStoresRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetConnectionStoresRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionStoresRequestPayload)
  payload: ToBackendGetConnectionStoresRequestPayload;
}

export class ToBackendGetConnectionStoresResponsePayload {
  storeItems: StoreItem[];
}

export class ToBackendGetConnectionStoresResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionStoresResponsePayload)
  payload: ToBackendGetConnectionStoresResponsePayload;
}

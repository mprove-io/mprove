import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { EnvsItem } from '#common/interfaces/backend/envs-item';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetEnvsListRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isFilter: boolean;
}

export class ToBackendGetEnvsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetEnvsListRequestPayload)
  payload: ToBackendGetEnvsListRequestPayload;
}

export class ToBackendGetEnvsListResponsePayload {
  @ValidateNested()
  @Type(() => EnvsItem)
  envsList: EnvsItem[];
}

export class ToBackendGetEnvsListResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetEnvsListResponsePayload)
  payload: ToBackendGetEnvsListResponsePayload;
}

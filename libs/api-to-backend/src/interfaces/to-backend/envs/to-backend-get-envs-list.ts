import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.EnvsItem)
  envsList: common.EnvsItem[];
}

export class ToBackendGetEnvsListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetEnvsListResponsePayload)
  payload: ToBackendGetEnvsListResponsePayload;
}

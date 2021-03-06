import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetViewsRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendGetViewsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetViewsRequestPayload)
  payload: ToBackendGetViewsRequestPayload;
}

export class ToBackendGetViewsResponsePayload {
  @ValidateNested()
  @Type(() => common.View)
  views: common.View[];
}

export class ToBackendGetViewsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetViewsResponsePayload)
  payload: ToBackendGetViewsResponsePayload;
}

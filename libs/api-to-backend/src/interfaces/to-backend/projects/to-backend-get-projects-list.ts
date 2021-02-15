import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetProjectsListRequestPayload {
  @IsString()
  orgId: string;
}

export class ToBackendGetProjectsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetProjectsListRequestPayload)
  payload: ToBackendGetProjectsListRequestPayload;
}

export class ToBackendGetProjectsListResponsePayloadProjectsItem {
  @IsString()
  projectId: string;

  @IsString()
  name: string;
}

export class ToBackendGetProjectsListResponsePayload {
  @ValidateNested()
  @Type(() => ToBackendGetProjectsListResponsePayloadProjectsItem)
  projectsList: ToBackendGetProjectsListResponsePayloadProjectsItem[];
}

export class ToBackendGetProjectsListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetProjectsListResponsePayload)
  payload: ToBackendGetProjectsListResponsePayload;
}

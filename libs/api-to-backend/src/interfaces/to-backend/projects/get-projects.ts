import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetProjectsRequestPayload {
  @IsString()
  orgId: string;
}

export class ToBackendGetProjectsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetProjectsRequestPayload)
  payload: ToBackendGetProjectsRequestPayload;
}

export class ToBackendGetProjectsResponsePayloadProjectsItem {
  @IsString()
  projectId: string;

  @IsString()
  name: string;
}

export class ToBackendGetProjectsResponsePayload {
  @ValidateNested()
  @Type(() => ToBackendGetProjectsResponsePayloadProjectsItem)
  projectsList: ToBackendGetProjectsResponsePayloadProjectsItem[];
}

export class ToBackendGetProjectsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetProjectsResponsePayload)
  payload: ToBackendGetProjectsResponsePayload;
}

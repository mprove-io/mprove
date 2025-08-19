import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { ProjectsItem } from '~common/interfaces/backend/projects-item';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetProjectsListRequestPayload {
  @IsString()
  orgId: string;
}

export class ToBackendGetProjectsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetProjectsListRequestPayload)
  payload: ToBackendGetProjectsListRequestPayload;
}

export class ToBackendGetProjectsListResponsePayload {
  @ValidateNested()
  @Type(() => ProjectsItem)
  projectsList: ProjectsItem[];
}

export class ToBackendGetProjectsListResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetProjectsListResponsePayload)
  payload: ToBackendGetProjectsListResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Member } from '~common/interfaces/backend/member';
import { Project } from '~common/interfaces/backend/project';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetProjectRequestPayload {
  @IsString()
  projectId: string;
}

export class ToBackendGetProjectRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetProjectRequestPayload)
  payload: ToBackendGetProjectRequestPayload;
}

export class ToBackendGetProjectResponsePayload {
  @ValidateNested()
  @Type(() => Project)
  project: Project;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;
}

export class ToBackendGetProjectResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetProjectResponsePayload)
  payload: ToBackendGetProjectResponsePayload;
}

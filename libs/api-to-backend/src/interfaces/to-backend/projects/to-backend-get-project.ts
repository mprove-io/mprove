import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.Project)
  project: common.Project;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;
}

export class ToBackendGetProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetProjectResponsePayload)
  payload: ToBackendGetProjectResponsePayload;
}

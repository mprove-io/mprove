import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateProjectRequestPayload {
  @IsString()
  name: string;
}

export class ToBackendCreateProjectRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateProjectRequestPayload)
  payload: ToBackendCreateProjectRequestPayload;
}

export class ToBackendCreateProjectResponsePayload {
  @IsString()
  project: common.Project;
}

export class ToBackendCreateProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateProjectResponsePayload)
  payload: ToBackendCreateProjectResponsePayload;
}

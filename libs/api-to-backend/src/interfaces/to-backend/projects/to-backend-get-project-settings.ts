import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetProjectSettingsRequestPayload {
  @IsString()
  projectId: string;
}

export class ToBackendGetProjectSettingsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetProjectSettingsRequestPayload)
  payload: ToBackendGetProjectSettingsRequestPayload;
}

export class ToBackendGetProjectSettingsResponsePayload {
  @ValidateNested()
  @Type(() => common.Project)
  project: common.Project[];
}

export class ToBackendGetProjectSettingsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetProjectSettingsResponsePayload)
  payload: ToBackendGetProjectSettingsResponsePayload;
}

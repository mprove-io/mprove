import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetProjectInfoRequestPayload {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class ToBackendSetProjectInfoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetProjectInfoRequestPayload)
  payload: ToBackendSetProjectInfoRequestPayload;
}

export class ToBackendSetProjectInfoResponsePayload {
  @IsString()
  project: common.Project;
}

export class ToBackendSetProjectInfoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetProjectInfoResponsePayload)
  payload: ToBackendSetProjectInfoResponsePayload;
}

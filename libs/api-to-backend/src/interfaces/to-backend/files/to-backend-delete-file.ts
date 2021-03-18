import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteFileRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  fileNodeId: string;
}

export class ToBackendDeleteFileRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteFileRequestPayload)
  payload: ToBackendDeleteFileRequestPayload;
}

export class ToBackendDeleteFileResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendDeleteFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteFileResponsePayload)
  payload: ToBackendDeleteFileResponsePayload;
}

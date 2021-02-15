import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetFileRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  parentNodeId: string;

  @IsString()
  fileName: string;
}

export class ToBackendGetFileRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetFileRequestPayload)
  payload: ToBackendGetFileRequestPayload;
}

export class ToBackendGetFileResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @IsString()
  content: string;
}

export class ToBackendGetFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetFileResponsePayload)
  payload: ToBackendGetFileResponsePayload;
}

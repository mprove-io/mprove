import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateFileRequestPayload {
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

export class ToBackendCreateFileRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateFileRequestPayload)
  payload: ToBackendCreateFileRequestPayload;
}

export class ToBackendCreateFileResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendCreateFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateFileResponsePayload)
  payload: ToBackendCreateFileResponsePayload;
}
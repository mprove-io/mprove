import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetFileRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  fileNodeId: string;
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

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;
}

export class ToBackendGetFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetFileResponsePayload)
  payload: ToBackendGetFileResponsePayload;
}

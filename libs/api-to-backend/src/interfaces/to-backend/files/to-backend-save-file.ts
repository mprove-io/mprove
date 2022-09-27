import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSaveFileRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  fileNodeId: string;

  @IsString()
  content: string;
}

export class ToBackendSaveFileRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveFileRequestPayload)
  payload: ToBackendSaveFileRequestPayload;
}

export class ToBackendSaveFileResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendSaveFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveFileResponsePayload)
  payload: ToBackendSaveFileResponsePayload;
}

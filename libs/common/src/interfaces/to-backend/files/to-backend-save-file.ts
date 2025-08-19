import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Struct } from '~common/interfaces/backend/struct';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => Struct)
  struct: Struct;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendSaveFileResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveFileResponsePayload)
  payload: ToBackendSaveFileResponsePayload;
}

import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { StructX } from '#common/interfaces/backend/struct-x';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendValidateFilesRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendValidateFilesRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendValidateFilesRequestPayload)
  payload: ToBackendValidateFilesRequestPayload;
}

export class ToBackendValidateFilesResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;
}

export class ToBackendValidateFilesResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendValidateFilesResponsePayload)
  payload: ToBackendValidateFilesResponsePayload;
}

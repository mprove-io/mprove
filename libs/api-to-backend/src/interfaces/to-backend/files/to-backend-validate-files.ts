import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendValidateFilesRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;
}

export class ToBackendValidateFilesRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendValidateFilesRequestPayload)
  payload: ToBackendValidateFilesRequestPayload;
}

export class ToBackendValidateFilesResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;
}

export class ToBackendValidateFilesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendValidateFilesResponsePayload)
  payload: ToBackendValidateFilesResponsePayload;
}

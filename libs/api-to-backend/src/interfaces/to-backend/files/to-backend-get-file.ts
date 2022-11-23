import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
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

  @IsEnum(common.PanelEnum)
  panel: common.PanelEnum;
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
  originalContent: string;

  @IsString()
  content: string;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;

  @IsBoolean()
  needValidate: boolean;

  @IsBoolean()
  isExist: boolean;
}

export class ToBackendGetFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetFileResponsePayload)
  payload: ToBackendGetFileResponsePayload;
}

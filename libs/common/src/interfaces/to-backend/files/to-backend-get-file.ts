import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { PanelEnum } from '~common/enums/panel.enum';
import { StructX } from '~common/interfaces/backend/struct-x';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

  @IsEnum(PanelEnum)
  panel: PanelEnum;
}

export class ToBackendGetFileRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetFileRequestPayload)
  payload: ToBackendGetFileRequestPayload;
}

export class ToBackendGetFileResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @IsString()
  originalContent: string;

  @IsString()
  content: string;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @IsBoolean()
  needValidate: boolean;

  @IsBoolean()
  isExist: boolean;
}

export class ToBackendGetFileResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetFileResponsePayload)
  payload: ToBackendGetFileResponsePayload;
}

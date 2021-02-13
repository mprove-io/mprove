import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskSaveFileRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  fileNodeId: string;

  @IsString()
  content: string;

  @IsString()
  userAlias: string;
}

export class ToDiskSaveFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskSaveFileRequestPayload)
  payload: ToDiskSaveFileRequestPayload;
}

export class ToDiskSaveFileResponsePayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  currentBranch: string;

  @IsEnum(enums.RepoStatusEnum)
  repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => common.DiskFileLine)
  conflicts: common.DiskFileLine[];
}

export class ToDiskSaveFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSaveFileResponsePayload)
  payload: ToDiskSaveFileResponsePayload;
}

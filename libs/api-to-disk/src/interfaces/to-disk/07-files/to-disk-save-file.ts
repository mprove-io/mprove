import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskSaveFileRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly fileNodeId: string;

  @IsString()
  readonly content: string;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskSaveFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskSaveFileRequestPayload)
  readonly payload: ToDiskSaveFileRequestPayload;
}

export class ToDiskSaveFileResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly currentBranch: string;

  @IsEnum(enums.RepoStatusEnum)
  readonly repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => common.DiskFileLine)
  readonly conflicts: common.DiskFileLine[];
}

export class ToDiskSaveFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSaveFileResponsePayload)
  readonly payload: ToDiskSaveFileResponsePayload;
}

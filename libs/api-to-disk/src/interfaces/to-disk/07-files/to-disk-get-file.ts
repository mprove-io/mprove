import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskGetFileRequestPayload {
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
}

export class ToDiskGetFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskGetFileRequestPayload)
  readonly payload: ToDiskGetFileRequestPayload;
}

export class ToDiskGetFileResponsePayload {
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

  @IsString()
  readonly content: string;
}

export class ToDiskGetFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetFileResponsePayload)
  readonly payload: ToDiskGetFileResponsePayload;
}

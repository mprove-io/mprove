import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCommitRepoRequestPayload {
  @IsString()
  readonly orgId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly userAlias: string;

  @IsString()
  readonly commitMessage: string;
}

export class ToDiskCommitRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCommitRepoRequestPayload)
  readonly payload: ToDiskCommitRepoRequestPayload;
}

export class ToDiskCommitRepoResponsePayload {
  @IsString()
  readonly orgId: string;

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

export class ToDiskCommitRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCommitRepoResponsePayload)
  readonly payload: ToDiskCommitRepoResponsePayload;
}

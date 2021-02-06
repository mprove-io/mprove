import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskMergeRepoRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly theirBranch: string;

  @IsBoolean()
  readonly isTheirBranchRemote: boolean;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskMergeRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskMergeRepoRequestPayload)
  readonly payload: ToDiskMergeRepoRequestPayload;
}

export class ToDiskMergeRepoResponsePayload {
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

export class ToDiskMergeRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskMergeRepoResponsePayload)
  readonly payload: ToDiskMergeRepoResponsePayload;
}

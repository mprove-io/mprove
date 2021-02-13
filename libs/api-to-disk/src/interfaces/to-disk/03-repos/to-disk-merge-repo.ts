import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskMergeRepoRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  theirBranch: string;

  @IsBoolean()
  isTheirBranchRemote: boolean;

  @IsString()
  userAlias: string;
}

export class ToDiskMergeRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskMergeRepoRequestPayload)
  payload: ToDiskMergeRepoRequestPayload;
}

export class ToDiskMergeRepoResponsePayload {
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

export class ToDiskMergeRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskMergeRepoResponsePayload)
  payload: ToDiskMergeRepoResponsePayload;
}

import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskPullRepoRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  userAlias: string;
}

export class ToDiskPullRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskPullRepoRequestPayload)
  payload: ToDiskPullRepoRequestPayload;
}

export class ToDiskPullRepoResponsePayload {
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

export class ToDiskPullRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskPullRepoResponsePayload)
  payload: ToDiskPullRepoResponsePayload;
}

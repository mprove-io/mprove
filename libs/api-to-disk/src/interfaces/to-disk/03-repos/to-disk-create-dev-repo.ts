import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCreateDevRepoRequestPayload {
  @IsString()
  readonly orgId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly devRepoId: string;
}

export class ToDiskCreateDevRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateDevRepoRequestPayload)
  readonly payload: ToDiskCreateDevRepoRequestPayload;
}

export class ToDiskCreateDevRepoResponsePayload {
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

export class ToDiskCreateDevRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateDevRepoResponsePayload)
  readonly payload: ToDiskCreateDevRepoResponsePayload;
}

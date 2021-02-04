import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

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

export class ToDiskMergeRepoRequest extends interfaces.ToDiskRequest {
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
  @Type(() => interfaces.DiskFileLine)
  readonly conflicts: interfaces.DiskFileLine[];
}

export class ToDiskMergeRepoResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskMergeRepoResponsePayload)
  readonly payload: ToDiskMergeRepoResponsePayload;
}

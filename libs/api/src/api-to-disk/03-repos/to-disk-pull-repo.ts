import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskPullRepoRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskPullRepoRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskPullRepoRequestPayload)
  readonly payload: ToDiskPullRepoRequestPayload;
}

export class ToDiskPullRepoResponsePayload {
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

export class ToDiskPullRepoResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskPullRepoResponsePayload)
  readonly payload: ToDiskPullRepoResponsePayload;
}

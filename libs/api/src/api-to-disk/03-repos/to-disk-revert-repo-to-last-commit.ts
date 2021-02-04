import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskRevertRepoToLastCommitRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;
}

export class ToDiskRevertRepoToLastCommitRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToLastCommitRequestPayload)
  readonly payload: ToDiskRevertRepoToLastCommitRequestPayload;
}

export class ToDiskRevertRepoToLastCommitResponsePayload {
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

export class ToDiskRevertRepoToLastCommitResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToLastCommitResponsePayload)
  readonly payload: ToDiskRevertRepoToLastCommitResponsePayload;
}

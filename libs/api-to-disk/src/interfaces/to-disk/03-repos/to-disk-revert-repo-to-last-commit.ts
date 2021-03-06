import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskRevertRepoToLastCommitRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;
}

export class ToDiskRevertRepoToLastCommitRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToLastCommitRequestPayload)
  payload: ToDiskRevertRepoToLastCommitRequestPayload;
}

export class ToDiskRevertRepoToLastCommitResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToDiskRevertRepoToLastCommitResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToLastCommitResponsePayload)
  payload: ToDiskRevertRepoToLastCommitResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskDeleteBranchRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => Project)
  project: Project;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;
}

export class ToDiskDeleteBranchRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteBranchRequestPayload)
  payload: ToDiskDeleteBranchRequestPayload;
}

export class ToDiskDeleteBranchResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @IsString()
  deletedBranch: string;
}

export class ToDiskDeleteBranchResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteBranchResponsePayload)
  payload: ToDiskDeleteBranchResponsePayload;
}

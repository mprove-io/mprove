import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskDeleteBranchRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

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
  @Type(() => common.Repo)
  repo: common.Repo;

  @IsString()
  deletedBranch: string;
}

export class ToDiskDeleteBranchResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteBranchResponsePayload)
  payload: ToDiskDeleteBranchResponsePayload;
}

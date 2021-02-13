import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
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
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  deletedBranch: string;

  @IsString()
  currentBranch: string;

  @IsEnum(enums.RepoStatusEnum)
  repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => common.DiskFileLine)
  conflicts: common.DiskFileLine[];
}

export class ToDiskDeleteBranchResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteBranchResponsePayload)
  payload: ToDiskDeleteBranchResponsePayload;
}

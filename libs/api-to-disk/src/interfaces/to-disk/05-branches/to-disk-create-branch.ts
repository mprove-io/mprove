import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCreateBranchRequestPayload {
  @IsString()
  readonly orgId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly newBranch: string;

  @IsString()
  readonly fromBranch: string;

  @IsBoolean()
  readonly isFromRemote: boolean;
}

export class ToDiskCreateBranchRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateBranchRequestPayload)
  readonly payload: ToDiskCreateBranchRequestPayload;
}

export class ToDiskCreateBranchResponsePayload {
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

export class ToDiskCreateBranchResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateBranchResponsePayload)
  readonly payload: ToDiskCreateBranchResponsePayload;
}

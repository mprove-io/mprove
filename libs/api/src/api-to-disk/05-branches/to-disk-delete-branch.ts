import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskDeleteBranchRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;
}

export class ToDiskDeleteBranchRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteBranchRequestPayload)
  readonly payload: ToDiskDeleteBranchRequestPayload;
}

export class ToDiskDeleteBranchResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly deletedBranch: string;

  @IsString()
  readonly currentBranch: string;

  @IsEnum(enums.RepoStatusEnum)
  readonly repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => interfaces.DiskFileLine)
  readonly conflicts: interfaces.DiskFileLine[];
}

export class ToDiskDeleteBranchResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteBranchResponsePayload)
  readonly payload: ToDiskDeleteBranchResponsePayload;
}

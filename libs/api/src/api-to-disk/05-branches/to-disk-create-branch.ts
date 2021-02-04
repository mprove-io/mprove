import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { interfaces } from '~api/barrels/interfaces';

export class ToDiskCreateBranchRequestPayload {
  @IsString()
  readonly organizationId: string;

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

export class ToDiskCreateBranchRequest extends interfaces.ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateBranchRequestPayload)
  readonly payload: ToDiskCreateBranchRequestPayload;
}

export class ToDiskCreateBranchResponsePayload {
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

export class ToDiskCreateBranchResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateBranchResponsePayload)
  readonly payload: ToDiskCreateBranchResponsePayload;
}

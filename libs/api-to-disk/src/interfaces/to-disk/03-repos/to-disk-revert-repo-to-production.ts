import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskRevertRepoToProductionRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;
}

export class ToDiskRevertRepoToProductionRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToProductionRequestPayload)
  readonly payload: ToDiskRevertRepoToProductionRequestPayload;
}

export class ToDiskRevertRepoToProductionResponsePayload {
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
  @Type(() => common.DiskFileLine)
  readonly conflicts: common.DiskFileLine[];
}

export class ToDiskRevertRepoToProductionResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToProductionResponsePayload)
  readonly payload: ToDiskRevertRepoToProductionResponsePayload;
}

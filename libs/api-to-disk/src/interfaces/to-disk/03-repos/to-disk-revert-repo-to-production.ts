import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskRevertRepoToProductionRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;
}

export class ToDiskRevertRepoToProductionRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToProductionRequestPayload)
  payload: ToDiskRevertRepoToProductionRequestPayload;
}

export class ToDiskRevertRepoToProductionResponsePayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  currentBranch: string;

  @IsEnum(enums.RepoStatusEnum)
  repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => common.DiskFileLine)
  conflicts: common.DiskFileLine[];
}

export class ToDiskRevertRepoToProductionResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToProductionResponsePayload)
  payload: ToDiskRevertRepoToProductionResponsePayload;
}

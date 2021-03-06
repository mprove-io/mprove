import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
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
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToDiskRevertRepoToProductionResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToProductionResponsePayload)
  payload: ToDiskRevertRepoToProductionResponsePayload;
}

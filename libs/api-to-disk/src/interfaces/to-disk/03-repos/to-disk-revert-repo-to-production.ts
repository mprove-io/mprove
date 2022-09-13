import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
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

  @IsEnum(common.ProjectRemoteTypeEnum)
  remoteType: common.ProjectRemoteTypeEnum;

  @IsString()
  @IsOptional()
  gitUrl?: string;

  @IsString()
  @IsOptional()
  privateKey?: string;

  @IsString()
  @IsOptional()
  publicKey?: string;
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

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  files: common.DiskCatalogFile[];
}

export class ToDiskRevertRepoToProductionResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToProductionResponsePayload)
  payload: ToDiskRevertRepoToProductionResponsePayload;
}

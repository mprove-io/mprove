import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskGetCatalogNodesRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsOptional()
  @IsString()
  branch?: string;
}

export class ToDiskGetCatalogNodesRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogNodesRequestPayload)
  payload: ToDiskGetCatalogNodesRequestPayload;
}

export class ToDiskGetCatalogNodesResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToDiskGetCatalogNodesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogNodesResponsePayload)
  payload: ToDiskGetCatalogNodesResponsePayload;
}
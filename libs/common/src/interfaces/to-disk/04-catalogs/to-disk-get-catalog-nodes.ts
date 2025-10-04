import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskGetCatalogNodesRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => Project)
  project: Project;

  @IsString()
  repoId: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsBoolean()
  isFetch: boolean;
}

export class ToDiskGetCatalogNodesRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogNodesRequestPayload)
  payload: ToDiskGetCatalogNodesRequestPayload;
}

export class ToDiskGetCatalogNodesResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;
}

export class ToDiskGetCatalogNodesResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogNodesResponsePayload)
  payload: ToDiskGetCatalogNodesResponsePayload;
}

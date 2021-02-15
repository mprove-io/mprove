import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendMoveCatalogNodeRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  fromNodeId: string;

  @IsString()
  toNodeId: string;
}

export class ToBackendMoveCatalogNodeRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendMoveCatalogNodeRequestPayload)
  payload: ToBackendMoveCatalogNodeRequestPayload;
}

export class ToBackendMoveCatalogNodeResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendMoveCatalogNodeResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendMoveCatalogNodeResponsePayload)
  payload: ToBackendMoveCatalogNodeResponsePayload;
}

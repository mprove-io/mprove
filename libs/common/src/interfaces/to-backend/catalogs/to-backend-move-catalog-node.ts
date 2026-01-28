import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { StructX } from '#common/interfaces/backend/struct-x';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendMoveCatalogNodeRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

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
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendMoveCatalogNodeResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendMoveCatalogNodeResponsePayload)
  payload: ToBackendMoveCatalogNodeResponsePayload;
}

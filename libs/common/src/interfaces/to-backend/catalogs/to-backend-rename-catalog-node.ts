import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Struct } from '~common/interfaces/backend/struct';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendRenameCatalogNodeRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  nodeId: string;

  @IsString()
  newName: string;
}

export class ToBackendRenameCatalogNodeRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRenameCatalogNodeRequestPayload)
  payload: ToBackendRenameCatalogNodeRequestPayload;
}

export class ToBackendRenameCatalogNodeResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => Struct)
  struct: Struct;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendRenameCatalogNodeResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRenameCatalogNodeResponsePayload)
  payload: ToBackendRenameCatalogNodeResponsePayload;
}

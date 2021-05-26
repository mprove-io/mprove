import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendRenameCatalogNodeRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

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
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;
}

export class ToBackendRenameCatalogNodeResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRenameCatalogNodeResponsePayload)
  payload: ToBackendRenameCatalogNodeResponsePayload;
}

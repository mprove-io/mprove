import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendMoveCatalogNodeResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendMoveCatalogNodeResponsePayload)
  payload: ToBackendMoveCatalogNodeResponsePayload;
}

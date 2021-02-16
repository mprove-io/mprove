import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetBranchesListRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;
}

export class ToBackendGetBranchesListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetBranchesListRequestPayload)
  payload: ToBackendGetBranchesListRequestPayload;
}

export class ToBackendGetBranchesListResponsePayloadBranchesItem {
  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendGetBranchesListResponsePayload {
  @ValidateNested()
  @Type(() => ToBackendGetBranchesListResponsePayloadBranchesItem)
  branchesList: ToBackendGetBranchesListResponsePayloadBranchesItem[];
}

export class ToBackendGetBranchesListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetBranchesListResponsePayload)
  payload: ToBackendGetBranchesListResponsePayload;
}

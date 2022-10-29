import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetBranchesListRequestPayload {
  @IsString()
  projectId: string;
}

export class ToBackendGetBranchesListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetBranchesListRequestPayload)
  payload: ToBackendGetBranchesListRequestPayload;
}

export class ToBackendGetBranchesListResponsePayloadBranchesItem {
  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;
}

export class ToBackendGetBranchesListResponsePayload {
  @ValidateNested()
  @Type(() => ToBackendGetBranchesListResponsePayloadBranchesItem)
  branchesList: ToBackendGetBranchesListResponsePayloadBranchesItem[];

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;
}

export class ToBackendGetBranchesListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetBranchesListResponsePayload)
  payload: ToBackendGetBranchesListResponsePayload;
}

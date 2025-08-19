import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Member } from '~common/interfaces/backend/member';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Member)
  userMember: Member;
}

export class ToBackendGetBranchesListResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetBranchesListResponsePayload)
  payload: ToBackendGetBranchesListResponsePayload;
}

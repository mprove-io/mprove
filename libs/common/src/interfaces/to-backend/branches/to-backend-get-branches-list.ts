import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { Member } from '#common/interfaces/backend/member';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { MyResponse } from '#common/interfaces/to/my-response';
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
  @IsString()
  repoId: string;

  @IsString()
  repoType: RepoTypeEnum;

  @IsString()
  branchId: string;
}

export class ToBackendGetBranchesListResponsePayload {
  @ValidateNested()
  @Type(() => ToBackendGetBranchesListResponsePayloadBranchesItem)
  branchesList: ToBackendGetBranchesListResponsePayloadBranchesItem[];

  @ValidateNested()
  @Type(() => SessionApi)
  sessionsList: SessionApi[];

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;
}

export class ToBackendGetBranchesListResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetBranchesListResponsePayload)
  payload: ToBackendGetBranchesListResponsePayload;
}

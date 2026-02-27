import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { Member } from '#common/interfaces/backend/member';
import { StructX } from '#common/interfaces/backend/struct-x';
import { User } from '#common/interfaces/backend/user';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetNavRequestPayload {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsBoolean()
  getRepo: boolean;
}

export class ToBackendGetNavRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetNavRequestPayload)
  payload: ToBackendGetNavRequestPayload;
}

export class ToBackendGetNavResponsePayload {
  @IsString()
  avatarSmall: string;

  @IsString()
  avatarBig: string;

  @IsString()
  orgId: string;

  @IsString()
  orgOwnerId: string;

  @IsString()
  orgName: string;

  @IsString()
  projectId: string;

  @IsString()
  projectName: string;

  @IsString()
  projectDefaultBranch: string;

  @IsString()
  repoId: string;

  @IsString()
  repoType: RepoTypeEnum;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => User)
  user: User;

  @IsInt()
  serverNowTs: number;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;
}

export class ToBackendGetNavResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetNavResponsePayload)
  payload: ToBackendGetNavResponsePayload;
}

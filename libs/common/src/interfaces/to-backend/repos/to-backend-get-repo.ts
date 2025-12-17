import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Member } from '~common/interfaces/backend/member';
import { StructX } from '~common/interfaces/backend/struct-x';
import { User } from '~common/interfaces/backend/user';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsBoolean()
  isFetch: boolean;
}

export class ToBackendGetRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetRepoRequestPayload)
  payload: ToBackendGetRepoRequestPayload;
}

export class ToBackendGetRepoResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => User)
  user: User;

  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;
}

export class ToBackendGetRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetRepoResponsePayload)
  payload: ToBackendGetRepoResponsePayload;
}

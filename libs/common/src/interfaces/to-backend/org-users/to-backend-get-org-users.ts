import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetOrgUsersRequestPayload {
  @IsString()
  orgId: string;

  @IsInt()
  pageNum: number;

  @IsInt()
  perPage: number;
}

export class ToBackendGetOrgUsersRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetOrgUsersRequestPayload)
  payload: ToBackendGetOrgUsersRequestPayload;
}

export class OrgUsersItem {
  @IsString()
  userId: string;

  @IsString()
  avatarSmall: string;

  @IsString()
  email: string;

  @IsString()
  alias: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  fullName: string;

  @IsString({ each: true })
  adminProjects: string[];

  @IsString({ each: true })
  editorProjects: string[];

  @IsString({ each: true })
  explorerProjects: string[];

  @IsString({ each: true })
  projectUserProjects: string[];
}

export class ToBackendGetOrgUsersResponsePayload {
  @ValidateNested()
  @Type(() => OrgUsersItem)
  orgUsersList: OrgUsersItem[];

  @IsInt()
  total: number;
}

export class ToBackendGetOrgUsersResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetOrgUsersResponsePayload)
  payload: ToBackendGetOrgUsersResponsePayload;
}

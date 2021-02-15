import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { enums } from '~api-to-backend/barrels/enums';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetOrgUsersRequestPayload {
  @IsString()
  orgId: string;
}

export class ToBackendGetOrgUsersRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetOrgUsersRequestPayload)
  payload: ToBackendGetOrgUsersRequestPayload;
}

export class OrgUsersItem {
  @IsString()
  avatarUrlSmall: string;

  @IsString()
  avatarUrlBig: string;

  @IsString()
  email: string;

  @IsString()
  alias: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(enums.UserStatusEnum)
  status: enums.UserStatusEnum;

  @IsString({ each: true })
  projectAdminProjects: string[];

  @IsString({ each: true })
  blockmlEditorProjects: string[];

  @IsString({ each: true })
  modelExplorerProjects: string[];

  @IsString({ each: true })
  projectUserProjects: string[];
}

export class ToBackendGetOrgUsersResponsePayload {
  @ValidateNested()
  @Type(() => OrgUsersItem)
  orgUsersList: OrgUsersItem[];
}

export class ToBackendGetOrgUsersResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetOrgUsersResponsePayload)
  payload: ToBackendGetOrgUsersResponsePayload;
}

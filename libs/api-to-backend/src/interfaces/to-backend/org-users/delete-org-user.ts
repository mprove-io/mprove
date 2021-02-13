import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { OrgUsersItem } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteOrgUserRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  userId: string;
}

export class ToBackendDeleteOrgUserRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteOrgUserRequestPayload)
  payload: ToBackendDeleteOrgUserRequestPayload;
}

export class ToBackendDeleteOrgUserResponsePayload {
  @ValidateNested()
  @Type(() => OrgUsersItem)
  orgUsersList: OrgUsersItem[];
}

export class ToBackendDeleteOrgUserResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteOrgUserResponsePayload)
  payload: ToBackendDeleteOrgUserResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetUserNameRequestPayload {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}

export class ToBackendSetUserNameRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetUserNameRequestPayload)
  payload: ToBackendSetUserNameRequestPayload;
}

export class ToBackendSetUserNameResponsePayload {
  @ValidateNested()
  @Type(() => common.User)
  user: common.User;
}

export class ToBackendSetUserNameResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetUserNameResponsePayload)
  payload: ToBackendSetUserNameResponsePayload;
}

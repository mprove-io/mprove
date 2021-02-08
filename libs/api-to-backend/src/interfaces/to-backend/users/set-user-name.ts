import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { User } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetUserNameRequestPayload {
  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;
}

export class ToBackendSetUserNameRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetUserNameRequestPayload)
  readonly payload: ToBackendSetUserNameRequestPayload;
}

export class ToBackendSetUserNameResponsePayload {
  @ValidateNested()
  @Type(() => User)
  readonly user: User;
}

export class ToBackendSetUserNameResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetUserNameResponsePayload)
  readonly payload: ToBackendSetUserNameResponsePayload;
}

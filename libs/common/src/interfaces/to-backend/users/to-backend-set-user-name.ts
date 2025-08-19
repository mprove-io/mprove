import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { User } from '~common/interfaces/backend/user';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => User)
  user: User;
}

export class ToBackendSetUserNameResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetUserNameResponsePayload)
  payload: ToBackendSetUserNameResponsePayload;
}

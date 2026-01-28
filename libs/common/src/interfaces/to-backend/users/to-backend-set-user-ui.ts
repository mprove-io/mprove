import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Ui } from '#common/interfaces/backend/ui';
import { User } from '#common/interfaces/backend/user';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSetUserUiRequestPayload {
  @ValidateNested()
  @Type(() => Ui)
  ui: Ui;
}

export class ToBackendSetUserUiRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetUserUiRequestPayload)
  payload: ToBackendSetUserUiRequestPayload;
}

export class ToBackendSetUserUiResponsePayload {
  @ValidateNested()
  @Type(() => User)
  user: User;
}

export class ToBackendSetUserUiResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetUserUiResponsePayload)
  payload: ToBackendSetUserUiResponsePayload;
}

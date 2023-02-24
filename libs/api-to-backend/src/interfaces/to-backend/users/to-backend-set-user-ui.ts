import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetUserUiRequestPayload {
  @ValidateNested()
  @Type(() => common.Ui)
  ui: common.Ui;
}

export class ToBackendSetUserUiRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetUserUiRequestPayload)
  payload: ToBackendSetUserUiRequestPayload;
}

export class ToBackendSetUserUiResponsePayload {
  @ValidateNested()
  @Type(() => common.User)
  user: common.User;
}

export class ToBackendSetUserUiResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetUserUiResponsePayload)
  payload: ToBackendSetUserUiResponsePayload;
}

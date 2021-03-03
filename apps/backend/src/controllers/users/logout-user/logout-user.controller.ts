import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class LogoutUserController {
  constructor() {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLogoutUser)
  async logoutUser(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendLogoutUserRequest)
    reqValid: apiToBackend.ToBackendLogoutUserRequest
  ) {
    let payload = {};

    return payload;
  }
}

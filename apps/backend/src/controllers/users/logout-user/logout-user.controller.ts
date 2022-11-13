import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

@UseGuards(ValidateRequestGuard)
@Controller()
export class LogoutUserController {
  constructor() {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLogoutUser)
  async logoutUser(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendLogoutUserRequest = request.body;

    let payload = {};

    return payload;
  }
}

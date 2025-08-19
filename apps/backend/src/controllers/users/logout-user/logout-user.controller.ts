import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

@UseGuards(ValidateRequestGuard)
@Controller()
export class LogoutUserController {
  constructor() {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLogoutUser)
  async logoutUser(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendLogoutUserRequest = request.body;

    let payload = {};

    return payload;
  }
}

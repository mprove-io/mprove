import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToBackendLogoutUserRequest } from '~common/interfaces/to-backend/users/to-backend-logout-user';

@UseGuards(ValidateRequestGuard)
@Controller()
export class LogoutUserController {
  constructor() {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendLogoutUser)
  async logoutUser(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendLogoutUserRequest = request.body;

    let payload = {};

    return payload;
  }
}

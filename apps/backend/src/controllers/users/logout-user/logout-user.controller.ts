import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToBackendLogoutUserRequest } from '~common/interfaces/to-backend/users/to-backend-logout-user';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class LogoutUserController {
  constructor() {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendLogoutUser)
  async logoutUser(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendLogoutUserRequest = request.body;

    let payload = {};

    return payload;
  }
}

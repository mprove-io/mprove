import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetUserProfileRequest,
  ToBackendGetUserProfileResponsePayload
} from '#common/interfaces/to-backend/users/to-backend-get-user-profile';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { UsersService } from '~backend/services/db/users.service';
import { TabService } from '~backend/services/tab.service';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetUserProfileController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetUserProfile)
  async getUserProfile(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetUserProfileRequest = request.body;

    let payload: ToBackendGetUserProfileResponsePayload = {
      user: this.usersService.tabToApi({ user: user })
    };

    return payload;
  }
}

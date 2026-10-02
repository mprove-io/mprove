import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetUserProfileRequestDto,
  ToBackendGetUserProfileResponseDto
} from '#backend/controllers/users/get-user-profile/get-user-profile.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendGetUserProfileOutput } from '#common/types/backend/routes/users/get-user-profile/get-user-profile-output';
import type { ToBackendRoute } from '#common/types/to-backend-route';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetUserProfileController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService
  ) {}

  @Post('api/ToBackendGetUserProfile' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetUserProfile',
    description: "Get the current user's profile"
  })
  @ApiOkResponse({
    type: ToBackendGetUserProfileResponseDto
  })
  async getUserProfile(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetUserProfileRequestDto
  ) {
    let payload: ToBackendGetUserProfileOutput = {
      user: this.usersService.tabToApi({ user: user })
    };

    return payload;
  }
}

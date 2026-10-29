import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  type ToBackendGetUserProfileRequestDto,
  ToBackendGetUserProfileResponseDto
} from '#backend/controllers/users/get-user-profile/get-user-profile.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { userTabToApi } from '#backend/functions/db/users/user-tab-to-api/user-tab-to-api';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetUserProfileOutput } from '#common/types/backend/routes/users/get-user-profile/get-user-profile-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetUserProfileController {
  constructor() {}

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
  ): Promise<BackendResultForOperation<'getUserProfile'>> {
    let payload: ToBackendGetUserProfileOutput = {
      user: userTabToApi({
        user: user
      })
    };

    return Result.succeed(payload);
  }
}

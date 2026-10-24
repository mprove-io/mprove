import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  type ToBackendPollUserCodexAuthRequestDto,
  ToBackendPollUserCodexAuthResponseDto
} from '#backend/controllers/users/poll-user-codex-auth/poll-user-codex-auth.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { pollDeviceAuth } from '#backend/functions/codex/poll-device-auth/poll-device-auth';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { getUserCheckExists } from '#backend/functions/db/users/get-user-check-exists/get-user-check-exists';
import { userTabToApi } from '#backend/functions/db/users/user-tab-to-api/user-tab-to-api';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendPollUserCodexAuthOutput } from '#common/types/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class PollUserCodexAuthController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendPollUserCodexAuth' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'PollUserCodexAuth',
    description:
      'Poll OpenAI for device-code authorization; on success stores Codex auth'
  })
  @ApiOkResponse({
    type: ToBackendPollUserCodexAuthResponseDto
  })
  async pollUserCodexAuth(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendPollUserCodexAuthRequestDto
  ): Promise<BackendResultForOperation<'pollUserCodexAuth'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        deviceAuthId: body.input.deviceAuthId,
        userCode: body.input.userCode
      }),
      Result.andThrough(v =>
        checkUserIsNotRestricted({
          user: v.user
        })
      ),
      Result.bind('status', v =>
        pollDeviceAuth({
          userId: v.user.userId,
          deviceAuthId: v.deviceAuthId,
          userCode: v.userCode,
          db: this.db
        })
      ),
      Result.bind('freshUser', async v =>
        v.status === 'Authorized'
          ? getUserCheckExists({
              userId: v.user.userId,
              db: this.db
            })
          : Result.succeed(undefined)
      ),
      Result.map(
        (v): ToBackendPollUserCodexAuthOutput =>
          v.status === 'Authorized'
            ? {
                status: v.status,
                user: userTabToApi({
                  user: v.freshUser
                })
              }
            : { status: v.status }
      )
    );
  }
}

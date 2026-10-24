import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  type ToBackendStartUserCodexAuthRequestDto,
  ToBackendStartUserCodexAuthResponseDto
} from '#backend/controllers/users/start-user-codex-auth/start-user-codex-auth.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { startDeviceAuth } from '#backend/functions/codex/start-device-auth/start-device-auth';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendStartUserCodexAuthOutput } from '#common/types/backend/routes/users/start-user-codex-auth/start-user-codex-auth-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class StartUserCodexAuthController {
  constructor() {}

  @Post('api/ToBackendStartUserCodexAuth' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'StartUserCodexAuth',
    description: 'Start OpenAI device-code OAuth flow for Codex'
  })
  @ApiOkResponse({
    type: ToBackendStartUserCodexAuthResponseDto
  })
  async startUserCodexAuth(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendStartUserCodexAuthRequestDto
  ): Promise<BackendResultForOperation<'startUserCodexAuth'>> {
    return Result.pipe(
      Result.succeed({ user: user }),
      Result.andThrough(v =>
        checkUserIsNotRestricted({
          user: v.user
        })
      ),
      Result.bind('started', v => startDeviceAuth()),
      Result.map(
        (v): ToBackendStartUserCodexAuthOutput => ({
          userCode: v.started.userCode,
          verificationUrl: v.started.verificationUrl,
          deviceAuthId: v.started.deviceAuthId,
          intervalSec: v.started.intervalSec
        })
      )
    );
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendPollUserCodexAuthRequestDto,
  ToBackendPollUserCodexAuthResponseDto
} from '#backend/controllers/users/poll-user-codex-auth/poll-user-codex-auth.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { CodexService } from '#backend/services/codex/codex.service';
import { UsersService } from '#backend/services/db/users/users.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetUserCheckExistsError } from '#common/types/backend/function-errors/get-user-check-exists-error';
import type { PollDeviceAuthError } from '#common/types/backend/function-errors/poll-device-auth-error';
import type { CodexDeviceAuthStatus } from '#common/types/backend/parts/codex/codex-device-auth-status';

import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendPollUserCodexAuthOutput } from '#common/types/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-output';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class PollUserCodexAuthController {
  constructor(
    private usersService: UsersService,
    private codexService: CodexService
  ) {}

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
        this.usersService.checkUserIsNotRestricted({ user: v.user })
      ),
      Result.bind(
        'status',
        (v): Result.ResultAsync<CodexDeviceAuthStatus, PollDeviceAuthError> =>
          this.codexService.pollDeviceAuth({
            userId: v.user.userId,
            deviceAuthId: v.deviceAuthId,
            userCode: v.userCode
          })
      ),
      Result.bind(
        'freshUser',
        async (v): Result.ResultAsync<UserTab, GetUserCheckExistsError> =>
          v.status === 'Authorized'
            ? this.usersService.getUserCheckExists({
                userId: v.user.userId
              })
            : Result.succeed(undefined)
      ),
      Result.map(
        (v): ToBackendPollUserCodexAuthOutput =>
          v.status === 'Authorized'
            ? {
                status: v.status,
                user: this.usersService.tabToApi({ user: v.freshUser })
              }
            : { status: v.status }
      )
    );
  }
}

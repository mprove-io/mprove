import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendPollUserCodexAuthRequestDto,
  ToBackendPollUserCodexAuthResponseDto
} from '#backend/controllers/users/poll-user-codex-auth/poll-user-codex-auth.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { CodexService } from '#backend/services/codex.service';
import { UsersService } from '#backend/services/db/users.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { CodexDeviceAuthStatusEnum } from '#common/enums/codex-device-auth-status.enum';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendPollUserCodexAuthOutput } from '#common/zod/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-output';

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
  ) {
    this.usersService.checkUserIsNotRestricted({ user: user });

    let { deviceAuthId, userCode } = body.input;

    let status = await this.codexService.pollDeviceAuth({
      userId: user.userId,
      deviceAuthId: deviceAuthId,
      userCode: userCode
    });

    let payload: ToBackendPollUserCodexAuthOutput;

    if (status === CodexDeviceAuthStatusEnum.Authorized) {
      let freshUser = await this.usersService.getUserCheckExists({
        userId: user.userId
      });

      payload = {
        status: status,
        user: this.usersService.tabToApi({ user: freshUser })
      };
    } else {
      payload = {
        status: status
      };
    }

    return payload;
  }
}

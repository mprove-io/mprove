import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendStartUserCodexAuthRequestDto,
  ToBackendStartUserCodexAuthResponseDto
} from '#backend/controllers/users/start-user-codex-auth/start-user-codex-auth.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { CodexService } from '#backend/services/codex.service';
import { UsersService } from '#backend/services/db/users.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendStartUserCodexAuthOutput } from '#common/types/backend/routes/users/start-user-codex-auth/start-user-codex-auth-output';
import type { ToBackendRoute } from '#common/types/to-backend-route';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class StartUserCodexAuthController {
  constructor(
    private usersService: UsersService,
    private codexService: CodexService
  ) {}

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
  ) {
    this.usersService.checkUserIsNotRestricted({ user: user });

    let started = await this.codexService.startDeviceAuth();

    let payload: ToBackendStartUserCodexAuthOutput = {
      userCode: started.userCode,
      verificationUrl: started.verificationUrl,
      deviceAuthId: started.deviceAuthId,
      intervalSec: started.intervalSec
    };

    return payload;
  }
}

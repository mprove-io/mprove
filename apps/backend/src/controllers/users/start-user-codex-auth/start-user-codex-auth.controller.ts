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
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendStartUserCodexAuthResponsePayload } from '#common/zod/to-backend/users/to-backend-start-user-codex-auth';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class StartUserCodexAuthController {
  constructor(
    private usersService: UsersService,
    private codexService: CodexService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendStartUserCodexAuth)
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

    let payload: ToBackendStartUserCodexAuthResponsePayload = {
      userCode: started.userCode,
      verificationUrl: started.verificationUrl,
      deviceAuthId: started.deviceAuthId,
      intervalSec: started.intervalSec
    };

    return payload;
  }
}

import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentSandboxLifecycleService } from '#backend/services/agent-sandbox-lifecycle.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendPauseAgentSessionRequest } from '#common/interfaces/to-backend/agent/to-backend-pause-agent-session';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class PauseAgentSessionController {
  constructor(
    private sessionsService: SessionsService,
    private agentLifecycleService: AgentSandboxLifecycleService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendPauseAgentSession)
  async pauseSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendPauseAgentSessionRequest = request.body;
    let { sessionId } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    await this.agentLifecycleService.pauseSessionById({ sessionId });

    let payload = {};

    return payload;
  }
}

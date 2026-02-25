import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { SessionsService } from '#backend/services/db/sessions.service';
import { SandboxService } from '#backend/services/sandbox.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendSetAgentSessionTitleRequest } from '#common/interfaces/to-backend/agent/to-backend-set-agent-session-title';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetAgentSessionTitleController {
  constructor(
    private sessionsService: SessionsService,
    private sandboxService: SandboxService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetAgentSessionTitle)
  async setAgentSessionTitle(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSetAgentSessionTitleRequest = request.body;
    let { sessionId, title } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    if (
      session.status === SessionStatusEnum.Active &&
      session.opencodeSessionId
    ) {
      let client = this.sandboxService.getOpenCodeClient(sessionId);

      await client.session.update(
        {
          sessionID: session.opencodeSessionId,
          title: title
        },
        { throwOnError: true }
      );
    }

    let payload = {};

    return payload;
  }
}

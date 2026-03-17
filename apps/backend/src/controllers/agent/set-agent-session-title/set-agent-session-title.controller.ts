import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentOpencodeService } from '#backend/services/agent/agent-opencode.service';
import { AgentStreamAiService } from '#backend/services/agent/agent-stream-ai.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendSetAgentSessionTitleRequest } from '#common/interfaces/to-backend/agent/to-backend-set-agent-session-title';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetAgentSessionTitleController {
  constructor(
    private sessionsService: SessionsService,
    private agentOpencodeService: AgentOpencodeService,
    private agentStreamAiService: AgentStreamAiService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetAgentSessionTitle)
  async setAgentSessionTitle(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSetAgentSessionTitleRequest = request.body;
    let { sessionId, title } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    if (session.sessionType === SessionTypeEnum.Editor) {
      // Type Editor: proxy to OpenCode
      let opencodeClient = await this.agentOpencodeService.getOpenCodeClient({
        sessionId: sessionId
      });

      await opencodeClient.session.update(
        {
          sessionID: session.opencodeSessionId,
          title: title
        },
        { throwOnError: true }
      );
    } else {
      // Type Explorer: set title via lock-holding pod (or acquire lock if none)
      await this.agentStreamAiService.setTitle({
        sessionId: sessionId,
        title: title
      });
    }

    let payload = {};

    return payload;
  }
}

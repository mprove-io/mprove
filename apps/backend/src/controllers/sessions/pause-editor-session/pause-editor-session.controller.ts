import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentSandboxService } from '#backend/services/agent/agent-sandbox.service';
import { AgentStreamOpencodeService } from '#backend/services/agent/agent-stream-opencode.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { PauseReasonEnum } from '#common/enums/pause-reason.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendPauseEditorSessionRequest,
  ToBackendPauseEditorSessionResponsePayload
} from '#common/interfaces/to-backend/sessions/to-backend-pause-editor-session';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class PauseEditorSessionController {
  constructor(
    private sessionsService: SessionsService,
    private agentSandboxService: AgentSandboxService,
    private agentStreamOpencodeService: AgentStreamOpencodeService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendPauseEditorSession)
  async pauseEditorSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendPauseEditorSessionRequest = request.body;
    let { sessionId } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    if (session.type !== SessionTypeEnum.Editor) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_TYPE_IS_NOT_EDITOR
      });
    }

    await this.agentStreamOpencodeService.publishStopSessionStream({
      sessionId: sessionId
    });

    await this.agentSandboxService.pauseSessionById({
      sessionId: sessionId,
      pauseReason: PauseReasonEnum.User
    });

    let freshSession = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    let freshSessionApi = this.sessionsService.tabToSessionApi({
      session: freshSession
    });

    let payload: ToBackendPauseEditorSessionResponsePayload = {
      session: freshSessionApi
    };

    return payload;
  }
}

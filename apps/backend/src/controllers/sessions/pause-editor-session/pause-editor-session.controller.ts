import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendPauseEditorSessionRequestDto,
  ToBackendPauseEditorSessionResponseDto
} from '#backend/controllers/sessions/pause-editor-session/pause-editor-session.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { SessionsService } from '#backend/services/db/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { PauseReasonEnum } from '#common/enums/pause-reason.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ServerError } from '#common/models/server-error';
import type { ToBackendPauseEditorSessionResponsePayload } from '#common/zod/to-backend/sessions/to-backend-pause-editor-session';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class PauseEditorSessionController {
  constructor(
    private sessionsService: SessionsService,
    private editorSandboxService: EditorSandboxService,
    private editorStreamService: EditorStreamService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendPauseEditorSession)
  @ApiOperation({
    summary: 'PauseEditorSession',
    description: 'Pause an editor session and its sandbox'
  })
  @ApiOkResponse({
    type: ToBackendPauseEditorSessionResponseDto
  })
  async pauseEditorSession(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendPauseEditorSessionRequestDto
  ) {
    let { sessionId } = body.payload;

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

    await this.editorStreamService.publishStopSessionStream({
      sessionId: sessionId
    });

    await this.editorSandboxService.pauseSessionById({
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

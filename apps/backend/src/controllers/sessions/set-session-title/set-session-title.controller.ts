import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { SessionsService } from '#backend/services/db/sessions.service';
import { EditorOpencodeService } from '#backend/services/editor/editor-opencode.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendSetSessionTitleRequest } from '#common/interfaces/to-backend/sessions/to-backend-set-session-title';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetSessionTitleController {
  constructor(
    private sessionsService: SessionsService,
    private editorOpencodeService: EditorOpencodeService,
    private explorerStreamService: ExplorerStreamService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetSessionTitle)
  async setSessionTitle(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSetSessionTitleRequest = request.body;
    let { sessionId, title } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    if (session.type === SessionTypeEnum.Editor) {
      // Type Editor: proxy to OpenCode
      let opencodeClient = await this.editorOpencodeService.getOpenCodeClient({
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
      await this.explorerStreamService.setTitle({
        sessionId: sessionId,
        title: title
      });
    }

    let payload = {};

    return payload;
  }
}

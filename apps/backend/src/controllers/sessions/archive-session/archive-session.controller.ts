import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { SessionArchiveService } from '#backend/services/session/session-archive.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { ErEnum } from '#common/enums/er.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendArchiveSessionRequest,
  ToBackendArchiveSessionResponsePayload
} from '#common/interfaces/to-backend/sessions/to-backend-archive-session';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ArchiveSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private sessionArchiveService: SessionArchiveService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendArchiveSession)
  async archiveSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendArchiveSessionRequest = request.body;
    let { sessionId } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
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

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    let sessionApi = await this.sessionArchiveService.archiveSession({
      session: session,
      archiveReason: ArchiveReasonEnum.User,
      e2bApiKey: project.e2bApiKey
    });

    let payload: ToBackendArchiveSessionResponsePayload = {
      session: sessionApi
    };

    return payload;
  }
}

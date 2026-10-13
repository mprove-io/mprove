import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendArchiveSessionRequestDto,
  ToBackendArchiveSessionResponseDto
} from '#backend/controllers/sessions/archive-session/archive-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ProjectTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { SessionArchiveService } from '#backend/services/session/session-archive/session-archive.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ArchiveSessionError } from '#common/types/backend/function-errors/archive-session-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';

import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendArchiveSessionOutput } from '#common/types/backend/routes/sessions/archive-session/archive-session-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ArchiveSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private sessionArchiveService: SessionArchiveService
  ) {}

  @Post('api/ToBackendArchiveSession' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'ArchiveSession',
    description: 'Archive an editor session and delete its sandbox'
  })
  @ApiOkResponse({
    type: ToBackendArchiveSessionResponseDto
  })
  async archiveSession(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendArchiveSessionRequestDto
  ): Promise<BackendResultForOperation<'archiveSession'>> {
    return Result.pipe(
      Result.succeed({ sessionId: body.input.sessionId, userId: user.userId }),
      Result.bind(
        'session',
        (v): Result.ResultAsync<SessionTab, GetSessionByIdCheckExistsError> =>
          this.sessionsService.getSessionByIdCheckExistsResult({
            sessionId: v.sessionId
          })
      ),
      Result.andThrough(v =>
        v.session.userId !== v.userId
          ? Result.fail({ code: 'BACKEND_UNAUTHORIZED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.session.type !== 'Editor'
          ? Result.fail({ code: 'BACKEND_SESSION_TYPE_IS_NOT_EDITOR' })
          : Result.succeed()
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.session.projectId
          })
      ),
      Result.bind(
        'sessionApi',
        (v): Result.ResultAsync<SessionApi, ArchiveSessionError> =>
          this.sessionArchiveService.archiveSessionResult({
            session: v.session,
            archiveReason: 'User',
            e2bApiKey: v.project.e2bApiKey
          })
      ),
      Result.map(
        (v): ToBackendArchiveSessionOutput => ({ session: v.sessionApi })
      )
    );
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendArchiveSessionRequestDto,
  ToBackendArchiveSessionResponseDto
} from '#backend/controllers/sessions/archive-session/archive-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { SessionArchiveService } from '#backend/services/session/session-archive/session-archive.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendArchiveSessionOutput } from '#common/types/backend/routes/sessions/archive-session/archive-session-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ArchiveSessionController {
  constructor(
    private sessionArchiveService: SessionArchiveService,
    private db: DbService
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
      Result.bind('session', v =>
        this.db.sessions.findFirstCheckExists({
          where: eq(sessionsTable.sessionId, v.sessionId)
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
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.session.projectId)
        })
      ),
      Result.bind('sessionApi', v =>
        this.sessionArchiveService.archiveSession({
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

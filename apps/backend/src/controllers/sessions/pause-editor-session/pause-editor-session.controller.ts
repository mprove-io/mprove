import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendPauseEditorSessionRequestDto,
  ToBackendPauseEditorSessionResponseDto
} from '#backend/controllers/sessions/pause-editor-session/pause-editor-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { AcquireSessionLockError } from '#common/types/backend/function-errors/acquire-session-lock-error';
import type { DbSessionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import type { PauseWhileLockedError } from '#common/types/backend/function-errors/pause-while-locked-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendPauseEditorSessionOutput } from '#common/types/backend/routes/sessions/pause-editor-session/pause-editor-session-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class PauseEditorSessionController {
  constructor(
    private sessionsService: SessionsService,
    private editorSandboxService: EditorSandboxService,
    private editorSessionLockService: EditorSessionLockService,
    private editorStreamService: EditorStreamService,
    private db: DbService
  ) {}

  @Post('api/ToBackendPauseEditorSession' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'pauseEditorSession'>> {
    return Result.pipe(
      Result.succeed({ sessionId: body.input.sessionId, userId: user.userId }),
      Result.bind(
        'session',
        (
          v
        ): Result.ResultAsync<
          SessionTab,
          DbSessionsFindFirstCheckExistsError
        > =>
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
      Result.bind(
        'sessionLockToken',
        (v): Result.ResultAsync<string, AcquireSessionLockError> =>
          this.editorSessionLockService.acquireSessionLock({
            sessionId: v.sessionId
          })
      ),
      Result.andThen(
        (
          v
        ): Result.ResultAsync<
          ToBackendPauseEditorSessionOutput,
          PauseWhileLockedError
        > =>
          this.pauseWhileLocked({
            sessionId: v.sessionId,
            sessionLockToken: v.sessionLockToken
          })
      )
    );
  }

  private async pauseWhileLocked(item: {
    sessionId: string;
    sessionLockToken: string;
  }): Result.ResultAsync<
    ToBackendPauseEditorSessionOutput,
    PauseWhileLockedError
  > {
    let { sessionId, sessionLockToken } = item;

    try {
      let result = await Result.pipe(
        Result.succeed(item),
        Result.andThrough(async v => {
          await this.editorStreamService.publishStopSessionStream({
            sessionId: v.sessionId
          });
          return Result.succeed();
        }),
        Result.andThrough(v =>
          this.editorSandboxService.pauseSessionById({
            sessionId: v.sessionId,
            pauseReason: 'User'
          })
        ),
        Result.bind(
          'freshSession',
          (
            v
          ): Result.ResultAsync<
            SessionTab,
            DbSessionsFindFirstCheckExistsError
          > =>
            this.db.sessions.findFirstCheckExists({
              where: eq(sessionsTable.sessionId, v.sessionId)
            })
        ),
        Result.map(
          (v): ToBackendPauseEditorSessionOutput => ({
            session: this.sessionsService.tabToSessionApi({
              session: v.freshSession
            })
          })
        )
      );

      return result;
    } finally {
      await this.editorSessionLockService.releaseSessionLock({
        sessionId: sessionId,
        token: sessionLockToken
      });
    }
  }
}

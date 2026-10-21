import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { DbService } from '#backend/services/db/db.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { AcquireSessionLockError } from '#common/types/backend/function-errors/acquire-session-lock-error';
import type { ArchiveSessionError } from '#common/types/backend/function-errors/archive-session-error';
import type { ArchiveSessionWhileLockedError } from '#common/types/backend/function-errors/archive-session-while-locked-error';
import type { ArchiveReason } from '#common/types/backend/parts/session/archive-reason';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';

@Injectable()
export class SessionArchiveService {
  constructor(
    private sessionsService: SessionsService,
    private editorSandboxService: EditorSandboxService,
    private editorSessionLockService: EditorSessionLockService,
    private editorStreamService: EditorStreamService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  async archiveSession(item: {
    session: SessionTab;
    archiveReason: ArchiveReason;
    e2bApiKey: string;
  }): Result.ResultAsync<SessionApi, ArchiveSessionError> {
    let { session } = item;

    let sessionLockToken: string;

    // TODO: check session type is editor
    if (session.type === 'Editor') {
      let lockResult: Result.Result<string, AcquireSessionLockError> =
        await this.editorSessionLockService.acquireSessionLock({
          sessionId: session.sessionId
        });

      if (Result.isFailure(lockResult)) {
        return lockResult;
      }

      sessionLockToken = lockResult.value;
    }

    try {
      let result: Result.Result<SessionApi, ArchiveSessionWhileLockedError> =
        await this.archiveSessionWhileLocked(item);

      return result;
    } finally {
      if (isDefined(sessionLockToken)) {
        await this.editorSessionLockService.releaseSessionLock({
          sessionId: session.sessionId,
          token: sessionLockToken
        });
      }
    }
  }

  private async archiveSessionWhileLocked(item: {
    session: SessionTab;
    archiveReason: ArchiveReason;
    e2bApiKey: string;
  }): Result.ResultAsync<SessionApi, ArchiveSessionWhileLockedError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('freshSession', async v =>
        v.session.type === 'Editor'
          ? this.db.sessions.findFirstCheckExists({
              where: eq(sessionsTable.sessionId, v.session.sessionId)
            })
          : Result.succeed(v.session)
      ),
      Result.andThrough(v => {
        let isActiveOrPaused: boolean = (
          ['Active', 'Paused'] satisfies SessionStatus[]
        ).some(status => status === v.freshSession.status);

        return v.freshSession.type === 'Editor' && isActiveOrPaused
          ? this.editorSandboxService.stopSandbox({
              sandboxType: v.freshSession.sandboxType,
              sandboxId: v.freshSession.sandboxId,
              e2bApiKey: v.e2bApiKey
            })
          : Result.succeed();
      }),
      Result.bind('updatedSession', v => {
        let updatedSession: SessionTab = {
          ...v.freshSession,
          status: 'Archived',
          archiveReason: v.archiveReason
        };

        return Result.succeed(updatedSession);
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            sessions: [v.updatedSession]
          }
        })
      ),
      Result.andThrough(v => {
        setTimeout(() => {
          if (v.freshSession.type === 'Editor') {
            void this.editorStreamService
              .publishStopSessionStream({
                sessionId: v.freshSession.sessionId
              })
              .catch(e => {
                logToConsoleBackend({
                  log: e,
                  logLevel: 'Error',
                  logger: this.logger,
                  cs: this.cs
                });
              });
          }
        }, 10_000);
        return Result.succeed();
      }),
      Result.map(
        (v): SessionApi =>
          this.sessionsService.tabToSessionApi({ session: v.updatedSession })
      )
    );
  }
}

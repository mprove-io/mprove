import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { AcquireSessionLockResultError } from '#common/types/backend/function-errors/acquire-session-lock-result-error';
import type { ArchiveSessionResultError } from '#common/types/backend/function-errors/archive-session-result-error';
import type { ArchiveSessionWhileLockedResultError } from '#common/types/backend/function-errors/archive-session-while-locked-result-error';
import type { GetSessionByIdCheckExistsResultError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-result-error';
import type { ArchiveReason } from '#common/types/backend/parts/session/archive-reason';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';

@Injectable()
export class SessionArchiveService {
  constructor(
    @Inject(DRIZZLE) private db: Db,
    private sessionsService: SessionsService,
    private editorSandboxService: EditorSandboxService,
    private editorSessionLockService: EditorSessionLockService,
    private editorStreamService: EditorStreamService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  async archiveSession(item: {
    session: SessionTab;
    archiveReason: ArchiveReason;
    e2bApiKey: string;
  }): Promise<SessionApi> {
    let result: Result.Result<SessionApi, ArchiveSessionResultError> =
      await this.archiveSessionResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let sessionApi: SessionApi = result.value;

    return sessionApi;
  }

  async archiveSessionResult(item: {
    session: SessionTab;
    archiveReason: ArchiveReason;
    e2bApiKey: string;
  }): Result.ResultAsync<SessionApi, ArchiveSessionResultError> {
    let { session } = item;

    let sessionLockToken: string;

    // TODO: check session type is editor
    if (session.type === 'Editor') {
      let lockResult: Result.Result<string, AcquireSessionLockResultError> =
        await this.editorSessionLockService.acquireSessionLockResult({
          sessionId: session.sessionId
        });

      if (Result.isFailure(lockResult)) {
        return lockResult;
      }

      sessionLockToken = lockResult.value;
    }

    try {
      let result: Result.Result<
        SessionApi,
        ArchiveSessionWhileLockedResultError
      > = await this.archiveSessionWhileLockedResult(item);

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

  private async archiveSessionWhileLockedResult(item: {
    session: SessionTab;
    archiveReason: ArchiveReason;
    e2bApiKey: string;
  }): Result.ResultAsync<SessionApi, ArchiveSessionWhileLockedResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'freshSession',
        async (
          v
        ): Result.ResultAsync<
          SessionTab,
          GetSessionByIdCheckExistsResultError
        > =>
          v.session.type === 'Editor'
            ? this.sessionsService.getSessionByIdCheckExistsResult({
                sessionId: v.session.sessionId
              })
            : Result.succeed(v.session)
      ),
      Result.andThrough(v => {
        let isActiveOrPaused: boolean = (
          ['Active', 'Paused'] satisfies SessionStatus[]
        ).some(status => status === v.freshSession.status);

        return v.freshSession.type === 'Editor' && isActiveOrPaused
          ? this.editorSandboxService.stopSandboxResult({
              sandboxType: v.freshSession.sandboxType,
              sandboxId: v.freshSession.sandboxId,
              e2bApiKey: v.e2bApiKey
            })
          : Result.succeed();
      }),
      Result.bind(
        'updatedSession',
        (v): Result.Result<SessionTab, never> =>
          Result.succeed({
            ...v.freshSession,
            status: 'Archived',
            archiveReason: v.archiveReason
          })
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(async tx => {
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      sessions: [v.updatedSession]
                    }
                  });
                }),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.inspect(v => {
        setTimeout(() => {
          if (v.freshSession.type === 'Editor') {
            this.editorStreamService
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
      }),
      Result.map(
        (v): SessionApi =>
          this.sessionsService.tabToSessionApi({ session: v.updatedSession })
      )
    );
  }
}

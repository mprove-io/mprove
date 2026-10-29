import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, lt } from 'drizzle-orm';
import { Sandbox, type SandboxInfo } from 'e2b';
import pIteration from 'p-iteration';
import { BackendConfig } from '#backend/config/backend-config';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { SessionTab } from '#backend/drizzle/postgres/tables/sessions';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { DbService } from '#backend/services/db/db.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { AcquireSessionLockError } from '#common/types/backend/function-errors/acquire-session-lock-error';
import type { DbSessionsFindManyError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-many-error';
import type { GetEditorSessionsToPauseError } from '#common/types/backend/function-errors/get-editor-sessions-to-pause-error';
import type { PauseSandboxError } from '#common/types/backend/function-errors/pause-sandbox-error';
import type { PauseSessionByIdError } from '#common/types/backend/function-errors/pause-session-by-id-error';
import type { ResumeSandboxError } from '#common/types/backend/function-errors/resume-sandbox-error';
import type { StopSandboxError } from '#common/types/backend/function-errors/stop-sandbox-error';
import type { SyncAllEditorSessionsStatusError } from '#common/types/backend/function-errors/sync-all-editor-sessions-status-error';
import type { PauseReason } from '#common/types/backend/parts/session/pause-reason';
import type { SandboxType } from '#common/types/backend/parts/session/sandbox-type';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';

const activeOrPausedStatuses: SessionStatus[] = ['Active', 'Paused'];

const { forEachSeries } = pIteration;

@Injectable()
export class EditorSandboxService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private editorSessionLockService: EditorSessionLockService,
    private logger: Logger,
    private db: DbService
  ) {}

  async getSandboxInfo(item: {
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<SandboxInfo | null> {
    let isApiKeySet = isDefinedAndNotEmpty(item.e2bApiKey);
    if (isApiKeySet === false) {
      return null;
    }

    try {
      return await Sandbox.getInfo(item.sandboxId, {
        apiKey: item.e2bApiKey
      });
    } catch {
      return null;
    }
  }

  async listSandboxes(item: { e2bApiKey: string }): Promise<SandboxInfo[]> {
    let isApiKeySet = isDefinedAndNotEmpty(item.e2bApiKey);
    if (isApiKeySet === false) {
      return [];
    }

    let all: SandboxInfo[] = [];
    let paginator = Sandbox.list({ apiKey: item.e2bApiKey });

    while (paginator.hasNext) {
      let page = await paginator.nextItems();
      all.push(...page);
    }

    return all;
  }

  async stopSandbox(item: {
    sandboxType?: SandboxType;
    sandboxId: string;
    e2bApiKey: string;
  }): Result.ResultAsync<void, StopSandboxError> {
    let { sandboxType, sandboxId, e2bApiKey } = item;

    if (isDefinedAndNotEmpty(e2bApiKey) === false) {
      return Result.succeed();
    }

    switch (sandboxType) {
      case 'E2B':
        await Sandbox.kill(sandboxId, { apiKey: e2bApiKey });

        return Result.succeed();
      default:
        return Result.fail({
          code: 'BACKEND_UNKNOWN_SANDBOX_TYPE'
        });
    }
  }

  async pauseSandbox(item: {
    sandboxType?: SandboxType;
    sandboxId: string;
    e2bApiKey: string;
  }): Result.ResultAsync<void, PauseSandboxError> {
    let { sandboxType, sandboxId, e2bApiKey } = item;

    if (isDefinedAndNotEmpty(e2bApiKey) === false) {
      return Result.succeed();
    }

    switch (sandboxType) {
      case 'E2B':
        await Sandbox.betaPause(sandboxId, { apiKey: e2bApiKey });

        return Result.succeed();
      default:
        return Result.fail({ code: 'BACKEND_UNKNOWN_SANDBOX_TYPE' });
    }
  }

  async resumeSandbox(item: {
    sandboxType?: SandboxType;
    sandboxId: string;
    e2bApiKey: string;
    timeoutMs: number;
  }): Result.ResultAsync<void, ResumeSandboxError> {
    let { sandboxType, sandboxId, e2bApiKey, timeoutMs } = item;

    switch (sandboxType) {
      case 'E2B':
        await Sandbox.connect(sandboxId, { apiKey: e2bApiKey });

        await Sandbox.setTimeout(sandboxId, timeoutMs, {
          apiKey: e2bApiKey
        });

        return Result.succeed();
      default:
        return Result.fail({ code: 'BACKEND_UNKNOWN_SANDBOX_TYPE' });
    }
  }

  async getEditorSessionsToPause(): Result.ResultAsync<
    string[],
    GetEditorSessionsToPauseError
  > {
    let sessionLastActivityToPauseMinutes = this.cs.get<
      BackendConfig['sessionLastActivityToPauseMinutes']
    >('sessionLastActivityToPauseMinutes');

    let pauseThresholdTs =
      Date.now() - sessionLastActivityToPauseMinutes * 60 * 1000;

    let sessionCollection: Result.Result<
      SessionTab[],
      DbSessionsFindManyError
    > = await this.db.sessions.findMany({
      where: and(
        eq(sessionsTable.type, 'Editor'),
        eq(sessionsTable.status, 'Active'),
        lt(sessionsTable.lastActivityTs, pauseThresholdTs)
      )
    });

    if (Result.isFailure(sessionCollection)) {
      return sessionCollection;
    }

    let sessionsToPause: SessionTab[] = sessionCollection.value;

    let sessionIdsToPause = sessionsToPause
      .filter(
        s =>
          s.lastActivityTs && s.lastActivityTs < pauseThresholdTs && s.sandboxId
      )
      .map(s => s.sessionId);

    return Result.succeed(sessionIdsToPause);
  }

  async pauseSessionById(item: {
    sessionId: string;
    pauseReason: PauseReason;
  }): Result.ResultAsync<void, PauseSessionByIdError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('session', v =>
        this.db.sessions.findFirstCheckExists({
          where: eq(sessionsTable.sessionId, v.sessionId)
        })
      ),
      Result.bind('project', async v =>
        v.session.type !== 'Editor' ||
        v.session.status !== 'Active' ||
        !v.session.sandboxId
          ? Result.succeed(undefined)
          : this.db.projects.findFirstCheckExists({
              where: eq(projectsTable.projectId, v.session.projectId)
            })
      ),
      Result.andThrough(v =>
        !v.project?.e2bApiKey
          ? Result.succeed()
          : this.pauseSandbox({
              sandboxType: v.session.sandboxType,
              sandboxId: v.session.sandboxId,
              e2bApiKey: v.project.e2bApiKey
            })
      ),
      Result.andThrough(v =>
        !v.project?.e2bApiKey
          ? Result.succeed()
          : dbErrorToResult({
              action: async () => {
                let updatedSession: SessionTab = {
                  ...v.session,
                  status: 'Paused',
                  pauseReason: v.pauseReason
                };

                await this.db.writeUnwrap({
                  insertOrUpdate: { sessions: [updatedSession] }
                });
              }
            })
      ),
      Result.map((v): void => undefined)
    );
  }

  async syncAllEditorSessionsStatus(): Result.ResultAsync<
    string[],
    SyncAllEditorSessionsStatusError
  > {
    let sessionCollection: Result.Result<
      SessionTab[],
      DbSessionsFindManyError
    > = await this.db.sessions.findMany({
      where: and(
        eq(sessionsTable.type, 'Editor'),
        inArray(sessionsTable.status, activeOrPausedStatuses)
      )
    });

    if (Result.isFailure(sessionCollection)) {
      return sessionCollection;
    }

    let sessions: SessionTab[] = sessionCollection.value;

    let uniqueProjectIds = [
      ...new Set(sessions.filter(s => s.sandboxId).map(s => s.projectId))
    ];

    let allPausedSessionIds: string[] = [];

    await forEachSeries(uniqueProjectIds, async projectId => {
      try {
        let project: ProjectTab =
          await this.db.projects.findFirstCheckExistsUnwrap({
            where: eq(projectsTable.projectId, projectId)
          });

        if (!project.e2bApiKey) {
          return;
        }

        let editorSessions = sessions.filter(s => s.projectId === projectId);

        let pausedSessionIds = await this.syncEditorSessionsStatus({
          editorSessions: editorSessions,
          e2bApiKey: project.e2bApiKey
        });

        allPausedSessionIds.push(...pausedSessionIds);
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SCHEDULER_SYNC_EDITOR_SESSIONS_STATUS_FAILED',
            originalError: e
          }),
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      }
    });

    return Result.succeed(allPausedSessionIds);
  }

  async syncEditorSessionsStatus(item: {
    editorSessions: SessionTab[];
    e2bApiKey: string;
  }): Promise<string[]> {
    let sessionsWithSandbox = item.editorSessions.filter(s => s.sandboxId);

    if (sessionsWithSandbox.length === 0) {
      return [];
    }

    let pausedSessionIds: string[] = [];

    await forEachSeries(sessionsWithSandbox, async session => {
      try {
        let sandboxInfo = await this.getSandboxInfo({
          sandboxId: session.sandboxId,
          e2bApiKey: item.e2bApiKey
        });

        let needsStatusChange =
          !sandboxInfo ||
          (session.status === 'Active' && sandboxInfo.state === 'paused');

        if (needsStatusChange === false) {
          return;
        }

        let sessionLockResult: Result.Result<string, AcquireSessionLockError> =
          await this.editorSessionLockService.acquireSessionLock({
            sessionId: session.sessionId
          });

        if (Result.isFailure(sessionLockResult)) {
          throw new ServerError({ message: sessionLockResult.error.code });
        }

        let sessionLockToken: string = sessionLockResult.value;

        try {
          let freshSession: SessionTab =
            await this.db.sessions.findFirstCheckExistsUnwrap({
              where: eq(sessionsTable.sessionId, session.sessionId)
            });

          let isActiveOrPaused = activeOrPausedStatuses.includes(
            freshSession.status
          );

          if (isActiveOrPaused === false || !freshSession.sandboxId) {
            return;
          }

          sandboxInfo = await this.getSandboxInfo({
            sandboxId: freshSession.sandboxId,
            e2bApiKey: item.e2bApiKey
          });

          if (!sandboxInfo) {
            // Sandbox no longer exists
            let updatedSession: SessionTab = {
              ...freshSession,
              status: 'Archived',
              archiveReason: 'Expire'
            };

            await this.db.writeUnwrap({
              insertOrUpdate: {
                sessions: [updatedSession]
              }
            });
          } else if (
            freshSession.status === 'Active' &&
            sandboxInfo.state === 'paused'
          ) {
            let updatedSession: SessionTab = {
              ...freshSession,
              status: 'Paused',
              pauseReason: 'External',
              sandboxStartTs: sandboxInfo.startedAt.getTime(),
              sandboxEndTs: sandboxInfo.endAt.getTime(),
              sandboxInfo: sandboxInfo
            };

            await this.db.writeUnwrap({
              insertOrUpdate: {
                sessions: [updatedSession]
              }
            });

            pausedSessionIds.push(freshSession.sessionId);
          }
        } finally {
          await this.editorSessionLockService.releaseSessionLock({
            sessionId: session.sessionId,
            token: sessionLockToken
          });
        }
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SCHEDULER_SYNC_EDITOR_SESSION_STATUS_FAILED',
            originalError: e
          }),
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      }
    });

    return pausedSessionIds;
  }
}

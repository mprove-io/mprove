import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, lt } from 'drizzle-orm';
import { Sandbox, type SandboxInfo } from 'e2b';
import pIteration from 'p-iteration';
import { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { StopSandboxResultError } from '#common/types/backend/function-errors/stop-sandbox-result-error';
import type { PauseReason } from '#common/types/backend/parts/session/pause-reason';
import type { SandboxType } from '#common/types/backend/parts/session/sandbox-type';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';

const activeOrPausedStatuses: SessionStatus[] = ['Active', 'Paused'];

const { forEachSeries } = pIteration;

@Injectable()
export class EditorSandboxService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private tabService: TabService,
    private editorSessionLockService: EditorSessionLockService,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
    sandboxType: SandboxType;
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<void> {
    let result: Result.Result<void, StopSandboxResultError> =
      await this.stopSandboxResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }
  }

  async stopSandboxResult(item: {
    sandboxType?: SandboxType;
    sandboxId: string;
    e2bApiKey: string;
  }): Result.ResultAsync<void, StopSandboxResultError> {
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
    sandboxType: SandboxType;
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<void> {
    let isApiKeySet = isDefinedAndNotEmpty(item.e2bApiKey);
    if (isApiKeySet === false) {
      return;
    }

    switch (item.sandboxType) {
      case 'E2B':
        await Sandbox.betaPause(item.sandboxId, { apiKey: item.e2bApiKey });

        break;
      default:
        throw new ServerError({
          message: 'BACKEND_UNKNOWN_SANDBOX_TYPE'
        });
    }
  }

  async resumeSandbox(item: {
    sandboxType: SandboxType;
    sandboxId: string;
    e2bApiKey: string;
    timeoutMs: number;
  }): Promise<void> {
    switch (item.sandboxType) {
      case 'E2B':
        await Sandbox.connect(item.sandboxId, { apiKey: item.e2bApiKey });

        await Sandbox.setTimeout(item.sandboxId, item.timeoutMs, {
          apiKey: item.e2bApiKey
        });

        break;
      default:
        throw new ServerError({
          message: 'BACKEND_UNKNOWN_SANDBOX_TYPE'
        });
    }
  }

  async getEditorSessionsToPause(): Promise<string[]> {
    let sessionLastActivityToPauseMinutes = this.cs.get<
      BackendConfig['sessionLastActivityToPauseMinutes']
    >('sessionLastActivityToPauseMinutes');

    let pauseThresholdTs =
      Date.now() - sessionLastActivityToPauseMinutes * 60 * 1000;

    let sessionsToPause = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: and(
          eq(sessionsTable.type, 'Editor'),
          eq(sessionsTable.status, 'Active'),
          lt(sessionsTable.lastActivityTs, pauseThresholdTs)
        )
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    let sessionIdsToPause = sessionsToPause
      .filter(
        s =>
          s.lastActivityTs && s.lastActivityTs < pauseThresholdTs && s.sandboxId
      )
      .map(s => s.sessionId);

    return sessionIdsToPause;
  }

  async pauseSessionById(item: {
    sessionId: string;
    pauseReason: PauseReason;
  }): Promise<void> {
    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: item.sessionId
    });

    if (
      session.type !== 'Editor' ||
      session.status !== 'Active' ||
      !session.sandboxId
    ) {
      return;
    }

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    if (!project.e2bApiKey) {
      return;
    }

    await this.pauseSandbox({
      sandboxType: session.sandboxType as SandboxType,
      sandboxId: session.sandboxId,
      e2bApiKey: project.e2bApiKey
    });

    let updatedSession: SessionTab = {
      ...session,
      status: 'Paused',
      pauseReason: item.pauseReason
    };

    await this.db.drizzle.transaction(
      async tx =>
        await this.db.packer.write({
          tx: tx,
          insertOrUpdate: {
            sessions: [updatedSession]
          }
        })
    );
  }

  async syncAllEditorSessionsStatus(): Promise<string[]> {
    let sessions = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: and(
          eq(sessionsTable.type, 'Editor'),
          inArray(sessionsTable.status, activeOrPausedStatuses)
        )
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    let uniqueProjectIds = [
      ...new Set(sessions.filter(s => s.sandboxId).map(s => s.projectId))
    ];

    let allPausedSessionIds: string[] = [];

    await forEachSeries(uniqueProjectIds, async projectId => {
      try {
        let project = await this.projectsService.getProjectCheckExists({
          projectId: projectId
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

    return allPausedSessionIds;
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

        let sessionLockToken: string =
          await this.editorSessionLockService.acquireSessionLock({
            sessionId: session.sessionId
          });

        try {
          let freshSession =
            await this.sessionsService.getSessionByIdCheckExists({
              sessionId: session.sessionId
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

            await this.db.drizzle.transaction(async tx => {
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  sessions: [updatedSession]
                }
              });
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

            await this.db.drizzle.transaction(
              async tx =>
                await this.db.packer.write({
                  tx: tx,
                  insertOrUpdate: {
                    sessions: [updatedSession]
                  }
                })
            );

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

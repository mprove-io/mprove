import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray, lt } from 'drizzle-orm';
import { Sandbox, type SandboxInfo } from 'e2b';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events.js';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { PauseReasonEnum } from '#common/enums/pause-reason.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ServerError } from '#common/models/server-error';
import { ProjectsService } from '../db/projects.service';
import { SessionsService } from '../db/sessions.service';
import { TabService } from '../tab.service';

@Injectable()
export class AgentSandboxService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private tabService: TabService,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getSandboxInfo(item: {
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<SandboxInfo | null> {
    try {
      return await Sandbox.getInfo(item.sandboxId, {
        apiKey: item.e2bApiKey
      });
    } catch {
      return null;
    }
  }

  async listSandboxes(item: { e2bApiKey: string }): Promise<SandboxInfo[]> {
    let all: SandboxInfo[] = [];
    let paginator = Sandbox.list({ apiKey: item.e2bApiKey });

    while (paginator.hasNext) {
      let page = await paginator.nextItems();
      all.push(...page);
    }

    return all;
  }

  async stopSandbox(item: {
    sandboxType: SandboxTypeEnum;
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        await Sandbox.kill(item.sandboxId, { apiKey: item.e2bApiKey });

        break;
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  async pauseSandbox(item: {
    sandboxType: SandboxTypeEnum;
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        await Sandbox.betaPause(item.sandboxId, { apiKey: item.e2bApiKey });

        break;
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  async resumeSandbox(item: {
    sandboxType: SandboxTypeEnum;
    sandboxId: string;
    e2bApiKey: string;
    timeoutMs: number;
  }): Promise<void> {
    switch (item.sandboxType) {
      case SandboxTypeEnum.E2B:
        await Sandbox.connect(item.sandboxId, { apiKey: item.e2bApiKey });

        await Sandbox.setTimeout(item.sandboxId, item.timeoutMs, {
          apiKey: item.e2bApiKey
        });

        break;
      default:
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_UNKNOWN_SANDBOX_TYPE
        });
    }
  }

  async getSessionIdsToPause(): Promise<string[]> {
    let sessionLastActivityToPauseMinutes = this.cs.get<
      BackendConfig['sessionLastActivityToPauseMinutes']
    >('sessionLastActivityToPauseMinutes');

    let pauseThresholdTs =
      Date.now() - sessionLastActivityToPauseMinutes * 60 * 1000;

    let sessionsToPause = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: and(
          eq(sessionsTable.status, SessionStatusEnum.Active),
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
    pauseReason: PauseReasonEnum;
  }): Promise<void> {
    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: item.sessionId
    });

    if (session.status !== SessionStatusEnum.Active || !session.sandboxId) {
      return;
    }

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    await this.pauseSandbox({
      sandboxType: session.sandboxType as SandboxTypeEnum,
      sandboxId: session.sandboxId,
      e2bApiKey: project.e2bApiKey
    });

    let updatedSession: SessionTab = {
      ...session,
      status: SessionStatusEnum.Paused,
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

  async syncSandboxStatuses(): Promise<string[]> {
    let sessions = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: inArray(sessionsTable.status, [
          SessionStatusEnum.Active,
          SessionStatusEnum.Paused
        ])
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    // Collect unique projectIds
    let projectIds = [
      ...new Set(sessions.filter(s => s.sandboxId).map(s => s.projectId))
    ];

    let pausedSessionIds: string[] = [];

    for (let projectId of projectIds) {
      try {
        let project = await this.projectsService.getProjectCheckExists({
          projectId: projectId
        });

        let projectPausedSessionIds = await this.syncProjectSandboxStatuses({
          projectId: projectId,
          e2bApiKey: project.e2bApiKey
        });

        pausedSessionIds.push(...projectPausedSessionIds);
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_SYNC_SANDBOX_STATUSES_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    }

    return pausedSessionIds;
  }

  async syncProjectSandboxStatuses(item: {
    projectId: string;
    e2bApiKey: string;
  }): Promise<string[]> {
    let sessions = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: and(
          eq(sessionsTable.projectId, item.projectId),
          inArray(sessionsTable.status, [
            SessionStatusEnum.Active,
            SessionStatusEnum.Paused
          ])
        )
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    let sessionsWithSandbox = sessions.filter(s => s.sandboxId);

    if (sessionsWithSandbox.length === 0) {
      return [];
    }

    let sandboxes = await this.listSandboxes({
      e2bApiKey: item.e2bApiKey
    });

    let pausedSessionIds: string[] = [];

    for (let session of sessionsWithSandbox) {
      try {
        let sandboxInfo = sandboxes.find(
          s => s.sandboxId === session.sandboxId
        );

        if (!sandboxInfo) {
          // Sandbox no longer exists
          let updatedSession: SessionTab = {
            ...session,
            status: SessionStatusEnum.Archived,
            archiveReason: ArchiveReasonEnum.Expire
          };

          await this.db.drizzle.transaction(async tx => {
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                sessions: [updatedSession]
              }
            });

            await tx
              .delete(ocEventsTable)
              .where(and(eq(ocEventsTable.sessionId, session.sessionId)));
          });
        } else if (
          session.status === SessionStatusEnum.Active &&
          sandboxInfo.state === 'paused'
        ) {
          let updatedSession: SessionTab = {
            ...session,
            status: SessionStatusEnum.Paused,
            pauseReason: PauseReasonEnum.External,
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

          pausedSessionIds.push(session.sessionId);
        }
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_SYNC_SANDBOX_STATUS_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    }

    return pausedSessionIds;
  }
}

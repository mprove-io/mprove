import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray, lt } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events.js';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ArchivedReasonEnum } from '#common/enums/archived-reason.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ServerError } from '#common/models/server-error';
import { AgentSandboxService } from './agent-sandbox.service';
import { ProjectsService } from './db/projects.service';
import { SessionsService } from './db/sessions.service';
import { TabService } from './tab.service';

@Injectable()
export class AgentSandboxLifecycleService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private agentSandboxService: AgentSandboxService,
    private tabService: TabService,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async pauseIdleSessions(): Promise<void> {
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

    for (let session of sessionsToPause) {
      if (
        session.lastActivityTs &&
        session.lastActivityTs < pauseThresholdTs &&
        session.sandboxId
      ) {
        let project = await this.projectsService.getProjectCheckExists({
          projectId: session.projectId
        });

        await this.agentSandboxService.pauseSandbox({
          sandboxType: session.sandboxType as SandboxTypeEnum,
          sandboxId: session.sandboxId,
          e2bApiKey: project.e2bApiKey
        });

        let updatedSession: SessionTab = {
          ...session,
          status: SessionStatusEnum.Paused
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
    }
  }

  async pauseSessionById(item: { sessionId: string }): Promise<void> {
    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: item.sessionId
    });

    if (session.status !== SessionStatusEnum.Active || !session.sandboxId) {
      return;
    }

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    await this.agentSandboxService.pauseSandbox({
      sandboxType: session.sandboxType as SandboxTypeEnum,
      sandboxId: session.sandboxId,
      e2bApiKey: project.e2bApiKey
    });

    let updatedSession: SessionTab = {
      ...session,
      status: SessionStatusEnum.Paused
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

  async syncSandboxStatuses(): Promise<void> {
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

    for (let projectId of projectIds) {
      try {
        let project = await this.projectsService.getProjectCheckExists({
          projectId: projectId
        });

        await this.syncProjectSandboxStatuses({
          projectId: projectId,
          e2bApiKey: project.e2bApiKey
        });
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
  }

  async syncProjectSandboxStatuses(item: {
    projectId: string;
    e2bApiKey: string;
  }): Promise<void> {
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
      return;
    }

    let sandboxes = await this.agentSandboxService.listSandboxes({
      e2bApiKey: item.e2bApiKey
    });

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
            archivedReason: ArchivedReasonEnum.Expire
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
  }
}

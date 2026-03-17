import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, eq, inArray } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { PauseReasonEnum } from '#common/enums/pause-reason.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ServerError } from '#common/models/server-error';
import { WithTraceSpan } from '#node-common/decorators/with-trace-span.decorator';
import { AgentSandboxService } from './agent/agent-sandbox.service';
import { AgentStreamOpencodeService } from './agent/agent-stream-opencode.service';
import { NotesService } from './db/notes.service';
import { ProjectsService } from './db/projects.service';
import { QueriesService } from './db/queries.service';
import { StructsService } from './db/structs.service';
import { TabService } from './tab.service';

@Injectable()
export class TasksService {
  private isRunningCheckQueries = false;
  private isRunningRemoveStructs = false;
  private isRunningRemoveQueries = false;
  private isRunningRemoveNotes = false;
  private isRunningSyncEditorSessionsStatus = false;
  private isRunningPauseIdleEditorSessions = false;

  constructor(
    private cs: ConfigService,
    private queriesService: QueriesService,
    private structsService: StructsService,
    private notesService: NotesService,
    private projectsService: ProjectsService,
    private agentSandboxService: AgentSandboxService,
    private agentStreamService: AgentStreamOpencodeService,
    private tabService: TabService,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Cron('*/3 * * * * *') // EVERY_3_SECONDS
  @WithTraceSpan()
  async loopCheckQueries() {
    if (this.isRunningCheckQueries === false) {
      this.isRunningCheckQueries = true;

      await this.queriesService.checkBigqueryRunningQueries().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERIES,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });

      this.isRunningCheckQueries = false;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  @WithTraceSpan()
  async loopRemoveStructs() {
    if (this.isRunningRemoveStructs === false) {
      this.isRunningRemoveStructs = true;

      await this.structsService.removeStructs().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_REMOVE_STRUCTS,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });

      this.isRunningRemoveStructs = false;
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @WithTraceSpan()
  async loopRemoveQueries() {
    if (this.isRunningRemoveQueries === false) {
      this.isRunningRemoveQueries = true;

      await this.queriesService.removeQueries().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_REMOVE_QUERIES,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });

      this.isRunningRemoveQueries = false;
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @WithTraceSpan()
  async loopRemoveNotes() {
    if (this.isRunningRemoveNotes === false) {
      this.isRunningRemoveNotes = true;

      await this.notesService.removeNotes().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_REMOVE_NOTES,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });

      this.isRunningRemoveNotes = false;
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  @WithTraceSpan()
  async loopSyncEditorSessionsStatus() {
    if (this.isRunningSyncEditorSessionsStatus === false) {
      this.isRunningSyncEditorSessionsStatus = true;

      let sessions = await this.db.drizzle.query.sessionsTable
        .findMany({
          where: and(
            eq(sessionsTable.sessionType, SessionTypeEnum.Editor),
            inArray(sessionsTable.status, [
              SessionStatusEnum.Active,
              SessionStatusEnum.Paused
            ])
          )
        })
        .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

      let uniqueProjectIds = [
        ...new Set(sessions.filter(s => s.sandboxId).map(s => s.projectId))
      ];

      for (let projectId of uniqueProjectIds) {
        try {
          let project = await this.projectsService.getProjectCheckExists({
            projectId: projectId
          });

          let editorSessions = sessions.filter(s => s.projectId === projectId);

          let pausedSessionIds =
            await this.agentSandboxService.syncEditorSessionsStatus({
              editorSessions: editorSessions,
              e2bApiKey: project.e2bApiKey
            });

          for (let sessionId of pausedSessionIds) {
            try {
              await this.agentStreamService.publishReloadSession({
                sessionId: sessionId
              });
            } catch (e) {
              logToConsoleBackend({
                log: new ServerError({
                  message:
                    ErEnum.BACKEND_SCHEDULER_PUBLISH_RELOAD_SESSION_FAILED,
                  originalError: e
                }),
                logLevel: LogLevelEnum.Error,
                logger: this.logger,
                cs: this.cs
              });
            }
          }
        } catch (e) {
          logToConsoleBackend({
            log: new ServerError({
              message:
                ErEnum.BACKEND_SCHEDULER_SYNC_EDITOR_SESSIONS_STATUS_FAILED,
              originalError: e
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        }
      }

      this.isRunningSyncEditorSessionsStatus = false;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  @WithTraceSpan()
  async loopPauseIdleEditorSessions() {
    if (this.isRunningPauseIdleEditorSessions === false) {
      this.isRunningPauseIdleEditorSessions = true;

      try {
        let sessionIdsToPause =
          await this.agentSandboxService.getEditorSessionsToPause();

        for (let sessionId of sessionIdsToPause) {
          try {
            await this.agentStreamService.publishStopSessionStream({
              sessionId: sessionId
            });
            await this.agentSandboxService.pauseSessionById({
              sessionId: sessionId,
              pauseReason: PauseReasonEnum.Idle
            });
            await this.agentStreamService.publishReloadSession({
              sessionId: sessionId
            });
          } catch (e) {
            logToConsoleBackend({
              log: new ServerError({
                message:
                  ErEnum.BACKEND_SCHEDULER_PAUSE_IDLE_EDITOR_SESSION_FALIED,
                originalError: e
              }),
              logLevel: LogLevelEnum.Error,
              logger: this.logger,
              cs: this.cs
            });
          }
        }
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_PAUSE_IDLE_EDITOR_SESSIONS_FALIED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }

      this.isRunningPauseIdleEditorSessions = false;
    }
  }
}

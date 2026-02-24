import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { WithTraceSpan } from '#node-common/decorators/with-trace-span.decorator';
import { AgentService } from './agent.service';
import { AgentModelsService } from './agent-models.service';
import { NotesService } from './db/notes.service';
import { QueriesService } from './db/queries.service';
import { StructsService } from './db/structs.service';

@Injectable()
export class TasksService {
  private isRunningCheckQueries = false;
  private isRunningRemoveStructs = false;
  private isRunningRemoveQueries = false;
  private isRunningRemoveNotes = false;
  private isRunningPauseIdleSandboxes = false;
  private isRunningUpdateAgentModelsCache = false;

  constructor(
    private cs: ConfigService,
    private queriesService: QueriesService,
    private structsService: StructsService,
    private notesService: NotesService,
    private agentService: AgentService,
    private agentModelsService: AgentModelsService,
    private logger: Logger
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

  @Cron(CronExpression.EVERY_HOUR)
  @WithTraceSpan()
  async loopUpdateAgentModelsCache() {
    if (this.isRunningUpdateAgentModelsCache === false) {
      this.isRunningUpdateAgentModelsCache = true;

      await this.agentModelsService.loadSharedModels().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_UPDATE_AGENT_MODELS_CACHE_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });

      this.isRunningUpdateAgentModelsCache = false;
    }
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  // @WithTraceSpan()
  // async loopPauseIdleSandboxes() {
  //   if (this.isRunningPauseIdleSandboxes === false) {
  //     this.isRunningPauseIdleSandboxes = true;

  //     await this.agentService.pauseIdleSessions().catch(e => {
  //       logToConsoleBackend({
  //         log: new ServerError({
  //           message: ErEnum.BACKEND_SCHEDULER_PAUSE_IDLE_SANDBOXES,
  //           originalError: e
  //         }),
  //         logLevel: LogLevelEnum.Error,
  //         logger: this.logger,
  //         cs: this.cs
  //       });
  //     });

  //     this.isRunningPauseIdleSandboxes = false;
  //   }
  // }
}

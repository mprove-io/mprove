import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ServerError } from '~common/models/server-error';
import { NotesService } from './db/notes.service';
import { QueriesService } from './db/queries.service';
import { StructsService } from './db/structs.service';

@Injectable()
export class TasksService {
  private isRunningCheckQueries = false;
  private isRunningRemoveOrphans = false;
  private isRunningRemoveNotes = false;

  constructor(
    private cs: ConfigService,
    private queriesService: QueriesService,
    private structsService: StructsService,
    private notesService: NotesService,
    private logger: Logger
  ) {}

  // // Called every 10 seconds
  // @Cron(CronExpression.EVERY_10_SECONDS)
  // handleCron() {
  // }

  @Cron('*/3 * * * * *')
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
  async loopRemoveOrphans() {
    if (this.isRunningRemoveOrphans === false) {
      this.isRunningRemoveOrphans = true;

      await this.structsService.removeOrphanedStructs().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_REMOVE_ORPHANED_STRUCTS,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });

      await this.queriesService.removeOrphanedQueries().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_REMOVE_ORPHANED_QUERIES,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });

      this.isRunningRemoveOrphans = false;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS) // increase value
  async loopRemoveNotes() {
    if (this.isRunningRemoveNotes === false) {
      this.isRunningRemoveNotes = true;

      await this.notesService.removeUnusedNotes().catch(e => {
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
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';
import { LessThan } from 'typeorm';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { QueriesService } from './queries.service';
import { StructsService } from './structs.service';

@Injectable()
export class TasksService {
  private isRunningLoopCheckQueries = false;
  private isRunningLoopRemoveOrphans = false;
  private isRunningLoopRemoveIdemps = false;

  constructor(
    private cs: ConfigService,
    private queriesService: QueriesService,
    private structsService: StructsService,
    private idempsRepository: repositories.IdempsRepository,
    private pinoLogger: PinoLogger
  ) {}

  // // Called every 10 seconds
  // @Cron(CronExpression.EVERY_10_SECONDS)
  // handleCron() {
  // }

  @Cron('*/3 * * * * *')
  async loopCheckQueries() {
    if (this.isRunningLoopCheckQueries === false) {
      this.isRunningLoopCheckQueries = true;

      await this.queriesService.checkBigqueryRunningQueries().catch(e => {
        logToConsoleBackend({
          log: new common.ServerError({
            message:
              common.ErEnum.BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERIES,
            originalError: e
          }),
          logLevel: common.LogLevelEnum.Error,
          pinoLogger: this.pinoLogger
        });
      });

      this.isRunningLoopCheckQueries = false;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async loopRemoveOrphans() {
    if (this.isRunningLoopRemoveOrphans === false) {
      this.isRunningLoopRemoveOrphans = true;

      await this.structsService.removeOrphanedStructs().catch(e => {
        logToConsoleBackend({
          log: new common.ServerError({
            message: common.ErEnum.BACKEND_SCHEDULER_REMOVE_ORPHANED_STRUCTS,
            originalError: e
          }),
          logLevel: common.LogLevelEnum.Error,
          pinoLogger: this.pinoLogger
        });
      });

      await this.queriesService.removeOrphanedQueries().catch(e => {
        logToConsoleBackend({
          log: new common.ServerError({
            message: common.ErEnum.BACKEND_SCHEDULER_REMOVE_ORPHANED_QUERIES,
            originalError: e
          }),
          logLevel: common.LogLevelEnum.Error,
          pinoLogger: this.pinoLogger
        });
      });

      this.isRunningLoopRemoveOrphans = false;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async loopRemoveIdemps() {
    if (this.isRunningLoopRemoveIdemps === false) {
      this.isRunningLoopRemoveIdemps = true;

      let offset = 1000 * 60 * 60 * 1;
      let ts = (Date.now() - offset).toString();

      await this.idempsRepository
        .delete({ server_ts: LessThan(ts) })
        .catch(e => {
          logToConsoleBackend({
            log: new common.ServerError({
              message: common.ErEnum.BACKEND_SCHEDULER_REMOVE_IDEMPS,
              originalError: e
            }),
            logLevel: common.LogLevelEnum.Error,
            pinoLogger: this.pinoLogger
          });
        });

      this.isRunningLoopRemoveIdemps = false;
    }
  }
}

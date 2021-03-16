import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { QueriesService } from './queries.service';

@Injectable()
export class TasksService {
  private isRunningLoopCheckQueries = false;

  constructor(
    private cs: ConfigService,
    private queriesService: QueriesService
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async loopCheckQueries() {
    if (this.isRunningLoopCheckQueries === false) {
      this.isRunningLoopCheckQueries = true;

      await this.queriesService.checkBigqueryRunningQueries().catch(e => {
        let serverError = new common.ServerError({
          message:
            apiToBackend.ErEnum
              .BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERIES,
          originalError: e
        });

        common.logToConsole(serverError);
      });

      this.isRunningLoopCheckQueries = false;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron() {
    common.logToConsole('Called every 10 seconds');
  }

  // @Interval(10000)
  // handleInterval() {
  //   common.logToConsole('Called every 10 seconds');
  // }

  // @Timeout(5000)
  // handleTimeout() {
  //   common.logToConsole('Called once after 5 seconds');
  // }
}

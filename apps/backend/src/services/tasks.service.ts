import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
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

      // try {
      await this.queriesService.checkRunningQueries();
      //     .catch(e =>
      //       helper.reThrow(e, enums.schedulerErrorsEnum.SCHEDULER_CHECK_QUERIES)
      //     );
      // } catch (err) {
      //   handler.errorToLog(err);
      // }

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

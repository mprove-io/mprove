import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor(private cs: ConfigService) {}

  private readonly logger = new Logger(TasksService.name);

  // @Cron('10 * * * * *')
  // handleCron() {
  //   common.logToConsole('Called when the second is 10');
  // }

  @Interval(10000)
  handleInterval() {
    this.logger.debug('Called every 10 seconds');
  }

  // @Timeout(5000)
  // handleTimeout() {
  //   this.logger.debug('Called once after 5 seconds');
  // }
}

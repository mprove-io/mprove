import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { DiskConfig } from '~disk/config/disk-config';
import { WithTraceSpan } from '~node-common/decorators/with-trace-span.decorator';
import { appServices } from './app-services';
import { getConfig } from './config/get.config';
import { logToConsoleDisk } from './functions/log-to-console-disk';

let devConfig = getConfig(); // check error once

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true
    })
  ],
  controllers: [],
  providers: [Logger, ...appServices]
})
export class AppModule implements OnModuleInit {
  constructor(
    private logger: Logger,
    private cs: ConfigService
  ) {}

  @WithTraceSpan()
  async onModuleInit() {
    setTimeout(() => {
      let diskEnv = this.cs.get<DiskConfig['diskEnv']>('diskEnv');

      logToConsoleDisk({
        log: `NODE_ENV "${process.env.NODE_ENV}", DISK_ENV "${diskEnv}"`,
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
    }, 1000);
  }
}

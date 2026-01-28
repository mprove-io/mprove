import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatConfig } from '#chat/config/chat-config';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { WithTraceSpan } from '#node-common/decorators/with-trace-span.decorator';
import { appServices } from './app-services';
import { getConfig } from './config/get.config';
import { logToConsoleChat } from './functions/log-to-console-chat';

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
      let chatEnv = this.cs.get<ChatConfig['chatEnv']>('chatEnv');

      logToConsoleChat({
        log: `NODE_ENV "${process.env.NODE_ENV}", CHAT_ENV "${chatEnv}"`,
        logLevel: LogLevelEnum.Info,
        logger: this.logger,
        cs: this.cs
      });
    }, 1000);
  }
}

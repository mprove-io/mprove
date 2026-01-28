import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import { appServices } from '#chat/app-services';
import { ChatConfig } from '#chat/config/chat-config';
import { getConfig } from '#chat/config/get.config';
import { ConsumerService } from '#chat/services/consumer.service';
import { MessageService } from '#chat/services/message.service';
import { APP_NAME_CHAT } from '#common/constants/top-chat';
import { ChatEnvEnum } from '#common/enums/env/chat-env.enum';
import { getLoggerOptions } from '#node-common/functions/get-logger-options';

export async function prepareTest(overrideConfigOptions?: ChatConfig) {
  let extraOverride: ChatConfig = {
    chatEnv: ChatEnvEnum.TEST,
    chatLogResponseError: true
  };

  let config = getConfig();

  let mockConfig = Object.assign(config, overrideConfigOptions, extraOverride);

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [getConfig],
        isGlobal: true
      }),
      WinstonModule.forRoot(
        getLoggerOptions({
          appName: APP_NAME_CHAT,
          isJson: config.chatLogIsJson
        })
      )
    ],
    providers: [Logger, ...appServices]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof ChatConfig] })
    .overrideProvider(ConsumerService)
    .useValue({})
    .compile();

  let cs = moduleRef.get<ConfigService<ChatConfig>>(ConfigService);
  let messageService = moduleRef.get<MessageService>(MessageService);
  let logger = await moduleRef.resolve<Logger>(Logger);

  return {
    messageService: messageService,
    logger: logger,
    cs: cs
  };
}

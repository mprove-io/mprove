import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatConfig } from '#chat/config/chat-config';
import { getConfig } from '#chat/config/get.config';
import { ChatEnvEnum } from '#common/enums/env/chat-env.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined';
import { logToConsole } from '#node-common/functions/log-to-console';

export function logToConsoleChat(item: {
  log: any;
  logger: Logger;
  logLevel: LogLevelEnum;
  cs: ConfigService;
}) {
  let { log, logger, logLevel, cs } = item;

  let logIsJson: boolean;
  let chatEnv: ChatEnvEnum;

  if (isDefined(cs)) {
    logIsJson = cs.get<ChatConfig['chatLogIsJson']>('chatLogIsJson');
    chatEnv = cs.get<ChatConfig['chatEnv']>('chatEnv');
  } else {
    let config = getConfig();
    logIsJson = config.chatLogIsJson;
    chatEnv = config.chatEnv;
  }

  logToConsole({
    log: log,
    logIsJson: logIsJson,
    logger: logger,
    logLevel: logLevel,
    useLoggerOnlyForErrorLevel: chatEnv !== ChatEnvEnum.PROD
  });
}

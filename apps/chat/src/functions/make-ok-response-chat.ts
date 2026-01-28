import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatConfig } from '#chat/config/chat-config';
import { ChatEnvEnum } from '~common/enums/env/chat-env.enum';
import { makeOkResponse } from '~node-common/functions/make-ok-response';

export function makeOkResponseChat(item: {
  body: any;
  payload: any;
  path: any;
  method: any;
  duration: number;
  cs: ConfigService<ChatConfig>;
  logger: Logger;
}) {
  let { payload, body, path, method, duration, cs, logger } = item;

  return makeOkResponse({
    body: body,
    payload: payload,
    path: path,
    method: method,
    duration: duration,
    logResponseOk: cs.get<ChatConfig['chatLogResponseOk']>('chatLogResponseOk'),
    logIsJson: cs.get<ChatConfig['chatLogIsJson']>('chatLogIsJson'),
    logger: logger,
    useLoggerOnlyForErrorLevel:
      cs.get<ChatConfig['chatEnv']>('chatEnv') !== ChatEnvEnum.PROD
  });
}

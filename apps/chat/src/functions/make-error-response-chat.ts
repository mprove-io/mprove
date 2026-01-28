import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatConfig } from '#chat/config/chat-config';
import { ChatEnvEnum } from '~common/enums/env/chat-env.enum';
import { makeErrorResponse } from '~node-common/functions/make-error-response';

export function makeErrorResponseChat(item: {
  body: any;
  e: any;
  path: any;
  method: any;
  duration: number;
  cs: ConfigService<ChatConfig>;
  logger: Logger;
}) {
  let { e, body, cs, path, method, duration, logger } = item;

  return makeErrorResponse({
    body: body,
    e: e,
    path: path,
    method: method,
    duration: duration,
    isRemoveErrorData: false,
    logResponseError: cs.get<ChatConfig['chatLogResponseError']>(
      'chatLogResponseError'
    ),
    logIsJson: cs.get<ChatConfig['chatLogIsJson']>('chatLogIsJson'),
    logger: logger,
    useLoggerOnlyForErrorLevel:
      cs.get<ChatConfig['chatEnv']>('chatEnv') !== ChatEnvEnum.PROD
  });
}

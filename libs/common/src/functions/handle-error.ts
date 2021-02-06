import { ConfigService } from '@nestjs/config';
import { logToConsole } from './log-to-console';
import { wrapError } from './wrap-error';

export function handleError(e: any, configService?: ConfigService) {
  let wrappedError = wrapError(e);
  logToConsole(wrappedError, configService);
  return;
}

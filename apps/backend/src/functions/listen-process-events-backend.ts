import { common } from '~backend/barrels/common';
import { logToConsoleBackend } from './log-to-console-backend';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEventsBackend() {
  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsoleBackend({
        log: `Received signal: ${signal}, application terminated`,
        pinoLogger: undefined,
        logLevel: common.LogLevelEnum.Fatal
      });
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsoleBackend({
      log: common.wrapError(
        new common.ServerError({
          message: common.ErEnum.BACKEND_UNCAUGHT_EXCEPTION,
          originalError: e
        })
      ),
      pinoLogger: undefined,
      logLevel: common.LogLevelEnum.Fatal
    });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleBackend({
      log: common.wrapError(
        new common.ServerError({
          message: common.ErEnum.BACKEND_UNHANDLED_REJECTION_REASON,
          data: {
            reason: reason
          }
        })
      ),
      logLevel: common.LogLevelEnum.Fatal,
      pinoLogger: undefined
    });
    promise.catch(e => {
      logToConsoleBackend({
        log: common.wrapError(
          new common.ServerError({
            message: common.ErEnum.BACKEND_UNHANDLED_REJECTION_ERROR,
            originalError: e,
            data: {
              reason: reason
            }
          })
        ),
        logLevel: common.LogLevelEnum.Fatal,
        pinoLogger: undefined
      });
      process.exit(1);
    });
  });
  return;
}

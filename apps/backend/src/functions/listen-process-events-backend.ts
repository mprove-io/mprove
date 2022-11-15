import { common } from '~backend/barrels/common';
import { logToConsoleBackend } from './log-to-console-backend';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEventsBackend() {
  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsoleBackend({
        log: new common.ServerError({
          message: common.ErEnum.BACKEND_APP_TERMINATED,
          data: {
            signal: signal
          }
        }),
        logLevel: common.LogLevelEnum.Error,
        logger: undefined,
        cs: undefined
      });
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsoleBackend({
      log: new common.ServerError({
        message: common.ErEnum.BACKEND_UNCAUGHT_EXCEPTION,
        originalError: e
      }),
      logLevel: common.LogLevelEnum.Error,
      logger: undefined,
      cs: undefined
    });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleBackend({
      log: new common.ServerError({
        message: common.ErEnum.BACKEND_UNHANDLED_REJECTION_REASON,
        data: {
          reason: reason
        }
      }),
      logLevel: common.LogLevelEnum.Error,
      logger: undefined,
      cs: undefined
    });
    promise.catch(e => {
      logToConsoleBackend({
        log: new common.ServerError({
          message: common.ErEnum.BACKEND_UNHANDLED_REJECTION_ERROR,
          originalError: e,
          data: {
            reason: reason
          }
        }),
        logLevel: common.LogLevelEnum.Error,
        logger: undefined,
        cs: undefined
      });
      process.exit(1);
    });
  });
  return;
}

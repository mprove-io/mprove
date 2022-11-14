import { common } from '~blockml/barrels/common';
import { logToConsoleBlockml } from './log-to-console-blockml';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEventsBlockml() {
  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsoleBlockml({
        log: new common.ServerError({
          message: common.ErEnum.BLOCKML_APP_TERMINATED,
          data: {
            signal: signal
          }
        }),
        logger: undefined,
        logLevel: common.LogLevelEnum.Error
      });
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsoleBlockml({
      log: new common.ServerError({
        message: common.ErEnum.BLOCKML_UNCAUGHT_EXCEPTION,
        originalError: e
      }),
      logger: undefined,
      logLevel: common.LogLevelEnum.Error
    });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleBlockml({
      log: new common.ServerError({
        message: common.ErEnum.BLOCKML_UNHANDLED_REJECTION_REASON,
        data: {
          reason: reason
        }
      }),
      logLevel: common.LogLevelEnum.Error,
      logger: undefined
    });
    promise.catch(e => {
      logToConsoleBlockml({
        log: new common.ServerError({
          message: common.ErEnum.BLOCKML_UNHANDLED_REJECTION_ERROR,
          originalError: e,
          data: {
            reason: reason
          }
        }),
        logLevel: common.LogLevelEnum.Error,
        logger: undefined
      });
      process.exit(1);
    });
  });
  return;
}

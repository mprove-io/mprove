import { common } from '~disk/barrels/common';
import { logToConsoleDisk } from './log-to-console-disk';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEventsDisk() {
  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsoleDisk({
        log: new common.ServerError({
          message: common.ErEnum.DISK_APP_TERMINATED,
          data: {
            signal: signal
          }
        }),
        pinoLogger: undefined,
        logLevel: common.LogLevelEnum.Error
      });
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsoleDisk({
      log: new common.ServerError({
        message: common.ErEnum.DISK_UNCAUGHT_EXCEPTION,
        originalError: e
      }),
      pinoLogger: undefined,
      logLevel: common.LogLevelEnum.Error
    });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleDisk({
      log: new common.ServerError({
        message: common.ErEnum.DISK_UNHANDLED_REJECTION_REASON,
        data: {
          reason: reason
        }
      }),
      logLevel: common.LogLevelEnum.Error,
      pinoLogger: undefined
    });
    promise.catch(e => {
      logToConsoleDisk({
        log: new common.ServerError({
          message: common.ErEnum.DISK_UNHANDLED_REJECTION_ERROR,
          originalError: e,
          data: {
            reason: reason
          }
        }),
        logLevel: common.LogLevelEnum.Error,
        pinoLogger: undefined
      });
      process.exit(1);
    });
  });
  return;
}

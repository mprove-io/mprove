import { common } from '~disk/barrels/common';
import { logToConsoleDisk } from './log-to-console-disk';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEventsDisk() {
  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsoleDisk({
        log: `Received signal: ${signal}, application terminated`,
        pinoLogger: undefined,
        logLevel: common.LogLevelEnum.Fatal
      });
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsoleDisk({
      log: common.wrapError(
        new common.ServerError({
          message: common.ErEnum.DISK_UNCAUGHT_EXCEPTION,
          originalError: e
        })
      ),
      pinoLogger: undefined,
      logLevel: common.LogLevelEnum.Fatal
    });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleDisk({
      log: common.wrapError(
        new common.ServerError({
          message: common.ErEnum.DISK_UNHANDLED_REJECTION_REASON,
          data: {
            reason: reason
          }
        })
      ),
      logLevel: common.LogLevelEnum.Fatal,
      pinoLogger: undefined
    });
    promise.catch(e => {
      logToConsoleDisk({
        log: common.wrapError(
          new common.ServerError({
            message: common.ErEnum.DISK_UNHANDLED_REJECTION_ERROR,
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

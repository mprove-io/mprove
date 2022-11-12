import { common } from '~blockml/barrels/common';
import { logToConsoleBlockml } from './log-to-console-blockml';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEventsBlockml() {
  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsoleBlockml({
        log: `Received signal: ${signal}, application terminated`,
        pinoLogger: undefined,
        logLevel: common.LogLevelEnum.Fatal
      });
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsoleBlockml({
      log: common.wrapError(
        new common.ServerError({
          message: common.ErEnum.BLOCKML_UNCAUGHT_EXCEPTION,
          originalError: e
        })
      ),
      pinoLogger: undefined,
      logLevel: common.LogLevelEnum.Fatal
    });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleBlockml({
      log: common.wrapError(
        new common.ServerError({
          message: common.ErEnum.BLOCKML_UNHANDLED_REJECTION_REASON,
          data: {
            reason: reason
          }
        })
      ),
      logLevel: common.LogLevelEnum.Fatal,
      pinoLogger: undefined
    });
    promise.catch(e => {
      logToConsoleBlockml({
        log: common.wrapError(
          new common.ServerError({
            message: common.ErEnum.BLOCKML_UNHANDLED_REJECTION_ERROR,
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

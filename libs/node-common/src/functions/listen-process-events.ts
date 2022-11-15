import { common } from '~node-common/barrels/common';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEvents(item: {
  appTerminated: common.ErEnum;
  uncaughtException: common.ErEnum;
  unhandledRejectionReason: common.ErEnum;
  unhandledRejection: common.ErEnum;
  logToConsoleFn: (x: any) => void;
}) {
  let {
    appTerminated,
    uncaughtException,
    unhandledRejectionReason,
    unhandledRejection,
    logToConsoleFn
  } = item;

  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsoleFn({
        log: new common.ServerError({
          message: appTerminated,
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
    logToConsoleFn({
      log: new common.ServerError({
        message: uncaughtException,
        originalError: e
      }),
      logLevel: common.LogLevelEnum.Error,
      logger: undefined,
      cs: undefined
    });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleFn({
      log: new common.ServerError({
        message: unhandledRejectionReason,
        data: {
          reason: reason
        }
      }),
      logLevel: common.LogLevelEnum.Error,
      logger: undefined,
      cs: undefined
    });
    promise.catch(e => {
      logToConsoleFn({
        log: new common.ServerError({
          message: unhandledRejection,
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

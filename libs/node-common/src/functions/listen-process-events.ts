import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ServerError } from '~common/models/server-error';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEvents(item: {
  appTerminated: ErEnum;
  uncaughtException: ErEnum;
  unhandledRejectionReason: ErEnum;
  unhandledRejection: ErEnum;
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
        log: new ServerError({
          message: appTerminated,
          data: {
            signal: signal
          }
        }),
        logLevel: LogLevelEnum.Error,
        logger: undefined,
        cs: undefined
      });
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsoleFn({
      log: new ServerError({
        message: uncaughtException,
        originalError: e
      }),
      logLevel: LogLevelEnum.Error,
      logger: undefined,
      cs: undefined
    });
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleFn({
      log: new ServerError({
        message: unhandledRejectionReason,
        data: {
          reason: reason
        }
      }),
      logLevel: LogLevelEnum.Error,
      logger: undefined,
      cs: undefined
    });
    promise.catch(e => {
      logToConsoleFn({
        log: new ServerError({
          message: unhandledRejection,
          originalError: e,
          data: {
            reason: reason
          }
        }),
        logLevel: LogLevelEnum.Error,
        logger: undefined,
        cs: undefined
      });
      process.exit(1);
    });
  });
  return;
}

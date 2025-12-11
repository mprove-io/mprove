import { NodeSDK } from '@opentelemetry/sdk-node';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { isDefined } from '~common/functions/is-defined';
import { ServerError } from '~common/models/server-error';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEvents(item: {
  tracerNodeSdk?: NodeSDK;
  appTerminated: ErEnum;
  uncaughtException: ErEnum;
  unhandledRejectionReason: ErEnum;
  unhandledRejection: ErEnum;
  logToConsoleFn: (x: any) => void;
}) {
  let {
    tracerNodeSdk,
    appTerminated,
    uncaughtException,
    unhandledRejectionReason,
    unhandledRejection,
    logToConsoleFn
  } = item;

  signalsNames.forEach(signalName =>
    process.on(signalName, async signal => {
      logToConsoleFn({
        log: new ServerError({
          message: appTerminated,
          customData: {
            signal: signal
          }
        }),
        logLevel: LogLevelEnum.Error,
        logger: undefined,
        cs: undefined
      });

      if (
        isDefined(tracerNodeSdk)
        // &&  signalName === 'SIGTERM'
      ) {
        await tracerNodeSdk
          .shutdown()
          .then(() => console.log('Tracing terminated'))
          .catch(error => console.log('Error terminating tracing', error));
      }

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
        customData: {
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
          customData: {
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

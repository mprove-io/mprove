import { NodeSDK } from '@opentelemetry/sdk-node';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { Er } from '#common/types/shared/errors/er';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEvents(item: {
  tracerNodeSdk?: NodeSDK;
  appTerminated: Er;
  uncaughtException: Er;
  unhandledRejectionReason: Er;
  unhandledRejection: Er;
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

  let shuttingDown = false;

  signalsNames.forEach(signalName =>
    process.on(signalName, async signal => {
      shuttingDown = true;
      logToConsoleFn({
        log: new ServerError({
          message: appTerminated,
          customData: {
            signal: signal
          }
        }),
        logLevel: 'Error',
        logger: undefined,
        cs: undefined
      });

      if (
        isDefined(tracerNodeSdk)
        // &&  signalName === 'SIGTERM'
      ) {
        await tracerNodeSdk
          .shutdown()
          .then(() => console.log('Telemetry SDK shut down successfully'))
          .catch(error =>
            console.log('Error shutting down Telemetry SDK', error)
          );
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
      logLevel: 'Error',
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
      logLevel: 'Error',
      logger: undefined,
      cs: undefined
    });
    if (!shuttingDown) {
      promise.catch(e => {
        logToConsoleFn({
          log: new ServerError({
            message: unhandledRejection,
            originalError: e,
            customData: {
              reason: reason
            }
          }),
          logLevel: 'Error',
          logger: undefined,
          cs: undefined
        });
        process.exit(1);
      });
    }
  });
  return;
}

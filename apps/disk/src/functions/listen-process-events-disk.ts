import { handleErrorDisk } from './handle-error-disk';
import { logToConsoleDisk } from './log-to-console-disk';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEventsDisk() {
  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsoleDisk(`Received signal: ${signal}, application terminated`);
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsoleDisk(`Uncaught Exception`);
    handleErrorDisk(e);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleDisk(`Unhandled Promise Rejection, reason: ${reason}`);
    promise.catch(e => {
      handleErrorDisk(e);
      process.exit(1);
    });
  });
  return;
}

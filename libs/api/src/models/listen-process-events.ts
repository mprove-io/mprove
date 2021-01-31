import { handleError } from './handle-error';
import { logToConsole } from './log-to-console';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEvents() {
  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsole(`Received signal: ${signal}, application terminated`);
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsole(`Uncaught Exception`);
    handleError(e);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsole(`Unhandled Promise Rejection, reason: ${reason}`);
    promise.catch(e => {
      handleError(e);
      process.exit(1);
    });
  });
  return;
}

import { handleErrorBackend } from '~backend/functions/handle-error-backend';
import { logToConsoleBackend } from './log-to-console-backend';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEventsBackend() {
  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsoleBackend(`Received signal: ${signal}, application terminated`);
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsoleBackend(`Uncaught Exception`);
    handleErrorBackend(e);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleBackend(`Unhandled Promise Rejection, reason: ${reason}`);
    promise.catch(e => {
      handleErrorBackend(e);
      process.exit(1);
    });
  });
  return;
}

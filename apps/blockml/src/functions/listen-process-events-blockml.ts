import { handleErrorBlockml } from './handle-error-blockml';
import { logToConsoleBlockml } from './log-to-console-blockml';

const signalsNames: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGHUP'];

export function listenProcessEventsBlockml() {
  signalsNames.forEach(signalName =>
    process.on(signalName, signal => {
      logToConsoleBlockml(`Received signal: ${signal}, application terminated`);
      process.exit(0);
    })
  );
  process.on('uncaughtException', e => {
    logToConsoleBlockml(`Uncaught Exception`);
    handleErrorBlockml(e);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason, promise) => {
    logToConsoleBlockml(`Unhandled Promise Rejection, reason: ${reason}`);
    promise.catch(e => {
      handleErrorBlockml(e);
      process.exit(1);
    });
  });
  return;
}

import { Cli } from 'clipanion';
import 'reflect-metadata';

import { ErEnum } from '#common/enums/er.enum';
import { listenProcessEvents } from '#node-common/functions/listen-process-events/listen-process-events';
import pkg from '../package.json';
import { appCommands } from './app-commands';
import type { CustomContext } from './classes/custom-command/custom-command';
import { logToConsoleMcli } from './functions/top/log-to-console-mcli/log-to-console-mcli';

listenProcessEvents({
  appTerminated: ErEnum.MCLI_APP_TERMINATED,
  uncaughtException: ErEnum.MCLI_UNCAUGHT_EXCEPTION,
  unhandledRejectionReason: ErEnum.MCLI_UNHANDLED_REJECTION_REASON,
  unhandledRejection: ErEnum.MCLI_UNHANDLED_REJECTION_ERROR,
  logToConsoleFn: logToConsoleMcli
});

let customContext: CustomContext = {
  ...Cli.defaultContext,
  config: undefined
};

Cli.from(appCommands, {
  enableCapture: false,
  enableColors: true,
  binaryLabel: 'Mprove CLI',
  binaryName: 'mprove',
  binaryVersion: pkg.version
}).runExit(process.argv.slice(2), customContext);

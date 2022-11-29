import { Cli } from 'clipanion';
// import 'module-alias/register';
import 'reflect-metadata';
import { common } from './barrels/common';
import { nodeCommon } from './barrels/node-common';
import { VersionCommand } from './commands/version/version';
import { logToConsoleMcli } from './functions/log-to-console-mcli';

nodeCommon.listenProcessEvents({
  appTerminated: common.ErEnum.MCLI_APP_TERMINATED,
  uncaughtException: common.ErEnum.MCLI_UNCAUGHT_EXCEPTION,
  unhandledRejectionReason: common.ErEnum.MCLI_UNHANDLED_REJECTION_REASON,
  unhandledRejection: common.ErEnum.MCLI_UNHANDLED_REJECTION_ERROR,
  logToConsoleFn: logToConsoleMcli
});

let appCommands = [VersionCommand];

Cli.from(appCommands).runExit(process.argv.slice(2), Cli.defaultContext);

import { Cli } from 'clipanion';
import 'reflect-metadata';
import { common } from './barrels/common';
import { nodeCommon } from './barrels/node-common';
import { CliDefinitionsCommand } from './commands/definitions/cli-definitions';
import { HelpCommand } from './commands/help/help';
import { RunCommand } from './commands/run-vis/run';
import { VersionCommand } from './commands/version/version';
import { logToConsoleMcli } from './functions/log-to-console-mcli';

nodeCommon.listenProcessEvents({
  appTerminated: common.ErEnum.MCLI_APP_TERMINATED,
  uncaughtException: common.ErEnum.MCLI_UNCAUGHT_EXCEPTION,
  unhandledRejectionReason: common.ErEnum.MCLI_UNHANDLED_REJECTION_REASON,
  unhandledRejection: common.ErEnum.MCLI_UNHANDLED_REJECTION_ERROR,
  logToConsoleFn: logToConsoleMcli
});

let appCommands = [
  VersionCommand,
  HelpCommand,
  CliDefinitionsCommand,
  RunCommand
];

Cli.from(appCommands, {
  binaryLabel: `Mprove`,
  binaryName: `mprove`,
  binaryVersion: require('../../../package.json').version
}).runExit(process.argv.slice(2), Cli.defaultContext);

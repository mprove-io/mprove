import { Cli } from 'clipanion';
import 'reflect-metadata';
import { common } from './barrels/common';
import { nodeCommon } from './barrels/node-common';
import { CliDefinitionsCommand } from './commands/cli-definitions/cli-definitions';
import { HelpCommand } from './commands/help/help';
import { RunDashboardsCommand } from './commands/run-dashboards/run-dashboards';
import { RunVisualizationsCommand } from './commands/run-visualizations/run-visualizations';
import { VersionCommand } from './commands/version/version';
import { logToConsoleMcli } from './functions/log-to-console-mcli';
import { CustomContext } from './models/custom-command';

nodeCommon.listenProcessEvents({
  appTerminated: common.ErEnum.MCLI_APP_TERMINATED,
  uncaughtException: common.ErEnum.MCLI_UNCAUGHT_EXCEPTION,
  unhandledRejectionReason: common.ErEnum.MCLI_UNHANDLED_REJECTION_REASON,
  unhandledRejection: common.ErEnum.MCLI_UNHANDLED_REJECTION_ERROR,
  logToConsoleFn: logToConsoleMcli
});

let appCommands = [
  CliDefinitionsCommand,
  HelpCommand,
  RunDashboardsCommand,
  RunVisualizationsCommand,
  VersionCommand
];

let customContext: CustomContext = {
  ...Cli.defaultContext,
  config: undefined // some commands doesn't need to read env vars to run
};

Cli.from(appCommands, {
  enableCapture: false,
  binaryLabel: `Mprove CLI`,
  binaryName: `mprove`,
  binaryVersion: require('../../../package.json').version
}).runExit(process.argv.slice(2), customContext);
